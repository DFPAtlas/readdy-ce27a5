FROM node:22-bookworm-slim

WORKDIR /app

COPY --chown=node:node server.mjs /app/server.mjs

USER node

EXPOSE 3200

CMD ["node", "/app/server.mjs"]
