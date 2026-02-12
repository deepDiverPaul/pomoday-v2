FROM node:20-alpine AS builder

WORKDIR /pomoday

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

CMD npm run start
