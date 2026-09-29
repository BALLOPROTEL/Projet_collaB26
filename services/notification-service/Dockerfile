FROM node:20-alpine
WORKDIR /app
RUN npm config set fetch-retries 6 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 300000
COPY services/notification-service/package.json ./package.json
RUN npm install --omit=dev --no-audit --no-fund
COPY services/notification-service/src ./src
ENV PORT=3003
EXPOSE 3003
CMD ["npm", "start"]
