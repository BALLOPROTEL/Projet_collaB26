FROM node:20-alpine
WORKDIR /app
COPY services/listing-service/package.json ./package.json
RUN npm install --omit=dev
COPY services/listing-service/src ./src
ENV PORT=3002
EXPOSE 3002
CMD ["npm", "start"]
