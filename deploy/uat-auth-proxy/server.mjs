import http from 'node:http';

const port = Number.parseInt(
  process.env.PORT ?? '3200',
  10,
);

const adminSupabaseUrl =
  process.env.ADMIN_SUPABASE_URL?.trim();

const adminSupabaseAnonKey =
  process.env.ADMIN_SUPABASE_ANON_KEY?.trim();

const releasesUrl =
  process.env.UAT_RELEASES_URL?.trim();

if (
  !adminSupabaseUrl ||
  !adminSupabaseAnonKey ||
  !releasesUrl
) {
  console.error(
    'Required authentication proxy environment variables are missing.',
  );

  process.exit(1);
}

function setSecurityHeaders(response) {
  response.setHeader(
    'Cache-Control',
    'private, no-store, max-age=0',
  );

  response.setHeader(
    'Pragma',
    'no-cache',
  );

  response.setHeader(
    'X-Content-Type-Options',
    'nosniff',
  );

  response.setHeader(
    'X-Frame-Options',
    'DENY',
  );

  response.setHeader(
    'Referrer-Policy',
    'no-referrer',
  );

  response.setHeader(
    'Vary',
    'Authorization',
  );
}

function sendJson(
  response,
  status,
  payload,
) {
  setSecurityHeaders(response);

  response.statusCode = status;

  response.setHeader(
    'Content-Type',
    'application/json; charset=utf-8',
  );

  response.end(
    JSON.stringify(payload),
  );
}

function getBearerToken(request) {
  const authorization =
    request.headers.authorization;

  if (
    typeof authorization !== 'string'
  ) {
    return null;
  }

  const match =
    authorization.match(
      /^Bearer\s+(.+)$/i,
    );

  const token =
    match?.[1]?.trim();

  if (
    !token ||
    token.length > 8192
  ) {
    return null;
  }

  return token;
}

async function fetchJson(
  url,
  options = {},
) {
  const response = await fetch(
    url,
    {
      ...options,
      signal:
        AbortSignal.timeout(12_000),
    },
  );

  const text =
    await response.text();

  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  return {
    response,
    body,
    text,
  };
}

async function authenticateAdministrator(
  token,
) {
  const userUrl =
    new URL(
      '/auth/v1/user',
      adminSupabaseUrl,
    );

  const userResult =
    await fetchJson(
      userUrl,
      {
        method: 'GET',

        headers: {
          Accept:
            'application/json',

          apikey:
            adminSupabaseAnonKey,

          Authorization:
            `Bearer ${token}`,
        },
      },
    );

  if (
    !userResult.response.ok ||
    !userResult.body?.id
  ) {
    return {
      ok: false,
      status: 401,
      code: 'invalid_session',
      message:
        'The administrator session is invalid or has expired.',
    };
  }

  const userId =
    String(
      userResult.body.id,
    );

  const profileUrl =
    new URL(
      '/rest/v1/admin_profiles',
      adminSupabaseUrl,
    );

  profileUrl.searchParams.set(
    'id',
    `eq.${userId}`,
  );

  profileUrl.searchParams.set(
    'select',
    'id,role,active',
  );

  profileUrl.searchParams.set(
    'limit',
    '1',
  );

  const profileResult =
    await fetchJson(
      profileUrl,
      {
        method: 'GET',

        headers: {
          Accept:
            'application/json',

          apikey:
            adminSupabaseAnonKey,

          Authorization:
            `Bearer ${token}`,
        },
      },
    );

  if (!profileResult.response.ok) {
    console.error(
      'Administrator profile verification failed.',
      {
        status:
          profileResult.response.status,
        userId,
      },
    );

    return {
      ok: false,
      status: 403,
      code: 'admin_profile_unavailable',
      message:
        'The administrator profile could not be verified.',
    };
  }

  const profile =
    Array.isArray(profileResult.body)
      ? profileResult.body[0]
      : null;

  if (
    !profile ||
    profile.active !== true ||
    ![
      'admin',
      'super_admin',
    ].includes(profile.role)
  ) {
    return {
      ok: false,
      status: 403,
      code: 'admin_access_denied',
      message:
        'Active administrator access is required.',
    };
  }

  return {
    ok: true,
    userId,
    role: profile.role,
  };
}

async function handleReleases(
  request,
  response,
) {
  const token =
    getBearerToken(request);

  if (!token) {
    sendJson(
      response,
      401,
      {
        ok: false,
        error: {
          code:
            'authentication_required',

          message:
            'A valid administrator session is required.',
        },
      },
    );

    return;
  }

  const authentication =
    await authenticateAdministrator(
      token,
    );

  if (!authentication.ok) {
    sendJson(
      response,
      authentication.status,
      {
        ok: false,
        error: {
          code:
            authentication.code,

          message:
            authentication.message,
        },
      },
    );

    return;
  }

  const releaseResult =
    await fetchJson(
      releasesUrl,
      {
        method: 'GET',

        headers: {
          Accept:
            'application/json',
        },
      },
    );

  if (!releaseResult.response.ok) {
    console.error(
      'Internal release workflow failed.',
      {
        status:
          releaseResult.response.status,

        administrator:
          authentication.userId,
      },
    );

    sendJson(
      response,
      502,
      {
        ok: false,
        error: {
          code:
            'release_service_failure',

          message:
            'Release information could not be loaded.',
        },
      },
    );

    return;
  }

  if (releaseResult.body === null) {
    sendJson(
      response,
      502,
      {
        ok: false,
        error: {
          code:
            'invalid_release_response',

          message:
            'The release service returned an invalid response.',
        },
      },
    );

    return;
  }

  sendJson(
    response,
    200,
    releaseResult.body,
  );
}

const server =
  http.createServer(
    async (
      request,
      response,
    ) => {
      try {
        const url =
          new URL(
            request.url ?? '/',
            'http://localhost',
          );

        if (
          request.method === 'GET' &&
          url.pathname === '/healthz'
        ) {
          sendJson(
            response,
            200,
            {
              ok: true,
              service:
                'dfp-uat-auth-proxy',
            },
          );

          return;
        }

        if (
          request.method === 'GET' &&
          url.pathname === '/releases'
        ) {
          await handleReleases(
            request,
            response,
          );

          return;
        }

        sendJson(
          response,
          404,
          {
            ok: false,
            error: {
              code: 'not_found',
              message:
                'The requested endpoint was not found.',
            },
          },
        );
      } catch (error) {
        console.error(
          'Authentication proxy request failed.',
          error instanceof Error
            ? error.message
            : 'Unknown error',
        );

        sendJson(
          response,
          500,
          {
            ok: false,
            error: {
              code:
                'proxy_failure',

              message:
                'The authentication proxy encountered an error.',
            },
          },
        );
      }
    },
  );

server.requestTimeout = 30_000;
server.headersTimeout = 15_000;
server.keepAliveTimeout = 5_000;

server.listen(
  port,
  '0.0.0.0',
  () => {
    console.log(
      `DFP UAT authentication proxy listening on port ${port}.`,
    );
  },
);
