FROM oven/bun:1.2.20-alpine AS development-dependencies-env

WORKDIR /app

COPY ./bun.lock ./package.json ./
COPY ./packages/ ./packages/

RUN bun install --frozen-lockfile

FROM oven/bun:1.2.20-alpine AS production-dependencies-env

WORKDIR /app

COPY ./bun.lock ./package.json ./
COPY ./packages/ ./packages/

RUN bun install --production --frozen-lockfile

FROM oven/bun:1.2.20-alpine AS build-env

WORKDIR /app

COPY --from=development-dependencies-env /app/ .

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

RUN bun run --cwd ./packages/ypiretis app:build

FROM oven/bun:1.2.20-alpine

WORKDIR /app

COPY --from=production-dependencies-env /app/ ./
COPY --from=build-env /app/packages/ypiretis/build/ ./packages/ypiretis/build/

ARG SERVER_PORT=3333
EXPOSE ${SERVER_PORT}

CMD ["bun", "run", "--cwd", "./packages/ypiretis", "app:start"]