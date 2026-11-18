FROM node:22-alpine
WORKDIR /app
COPY package.json server.mjs ./
ENV PORT=8080 PULSE_LIVE_ENABLED=false
USER node
CMD ["node", "server.mjs"]
