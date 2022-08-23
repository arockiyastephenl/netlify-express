FROM node:14

RUN mkdir -p /app
WORKDIR /app

COPY . .
RUN npm install

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "start"]