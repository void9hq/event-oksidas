# Event website + RSVP. Build: site only; runtime: plain node, no node_modules.
FROM node:24.22.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run site:build

FROM node:24.22.0-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080 DB_PATH=/data/rsvp.db STATIC_DIR=/app/dist-site
COPY server ./server
COPY --from=build /app/dist-site ./dist-site
# owned by node so a fresh named volume inherits writable permissions
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 8080
CMD ["node", "--disable-warning=ExperimentalWarning", "server/server.js"]
