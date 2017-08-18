FROM node:boron-alpine

ADD . /app

WORKDIR /app

EXPOSE 3000

CMD npm start