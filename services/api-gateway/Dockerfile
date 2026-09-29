FROM node:20-alpine
WORKDIR /app
RUN npm config set fetch-retries 6 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 300000
COPY services/api-gateway/package.json ./package.json
RUN npm install --omit=dev --no-audit --no-fund
COPY services/api-gateway/src ./src
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
