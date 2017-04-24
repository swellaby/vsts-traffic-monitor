FROM alpine:3.4

RUN apk add --no-cache --update nodejs &&\
    mkdir /app

ADD . /app

WORKDIR /app

EXPOSE 3000

CMD npm start