FROM node:20-alpine AS development-dependencies-env

COPY . /app

WORKDIR /app
RUN bun install --frozen-lockfile

FROM node:20-alpine AS production-dependencies-env

COPY ./package.json package-lock.json /app/

WORKDIR /app
RUN bun install --production --frozen-lockfile

FROM node:20-alpine AS build-env

COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules

ARG ACCOUNT_PROVIDER_DOMAIN
ENV ACCOUNT_PROVIDER_DOMAIN=${ACCOUNT_PROVIDER_DOMAIN}

ARG ACCOUNT_PROVIDER_NAME
ENV ACCOUNT_PROVIDER_NAME=${ACCOUNT_PROVIDER_NAME}

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

ARG APP_URL
ENV APP_URL=${APP_URL}

ARG ARTICLES_ATTACHMENTS_MAX_FILE_SIZE
ENV ARTICLES_ATTACHMENTS_MAX_FILE_SIZE=${ARTICLES_ATTACHMENTS_MAX_FILE_SIZE}

ARG EVENTS_ATTACHMENTS_MAX_FILE_SIZE
ENV EVENTS_ATTACHMENTS_MAX_FILE_SIZE=${EVENTS_ATTACHMENTS_MAX_FILE_SIZE}

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

ARG SERVER_HOST
ENV SERVER_HOST=${SERVER_HOST}

ARG SERVER_PORT
ENV SERVER_PORT=${SERVER_PORT}

ARG UPLOADS_MAX_FILE_SIZE
ENV UPLOADS_MAX_FILE_SIZE=${UPLOADS_MAX_FILE_SIZE}

WORKDIR /app
RUN bun run app:build

FROM node:20-alpine

COPY ./package.json package-lock.json server.js /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build

ARG SERVER_HOST

WORKDIR /app
EXPOSE ${SERVER_PORT}
CMD ["bun", "app:run", "start"]