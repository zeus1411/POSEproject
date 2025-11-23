FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN mkdir -p uploads public/uploads

EXPOSE 3000

CMD ["npm", "start"]
