FROM node:20-alpine AS build

WORKDIR /app
RUN npm config set fetch-retries 6 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 300000
COPY apps/web/package.json ./package.json
RUN npm install --no-audit --no-fund
COPY apps/web ./

ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_KEYCLOAK_URL=http://localhost:8082
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL}

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
