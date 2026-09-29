FROM node:20-alpine
WORKDIR /app
COPY services/catalog-service/package.json ./package.json
RUN npm install --omit=dev
COPY services/catalog-service/src ./src
ENV PORT=3001
EXPOSE 3001
CMD ["npm", "start"]
