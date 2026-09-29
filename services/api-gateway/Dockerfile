FROM node:20-alpine
WORKDIR /app
COPY services/api-gateway/package.json ./package.json
RUN npm install --omit=dev
COPY services/api-gateway/src ./src
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
