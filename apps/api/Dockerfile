FROM node:20-alpine

WORKDIR /app

COPY apps/api/package.json ./package.json
RUN npm install --omit=dev

COPY apps/api/src ./src

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
