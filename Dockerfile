ARG MAIN_DATABASE_URL
ARG DEV_DATABASE_URL
ARG REDIS_URL


FROM node:18.17.1

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV MAIN_DATABASE_URL=$MAIN_DATABASE_URL
ENV DEV_DATABASE_URL=$DEV_DATABASE_URL
ENV REDIS_URL=$REDIS_URL


EXPOSE 8080

CMD ["npm", "start"]