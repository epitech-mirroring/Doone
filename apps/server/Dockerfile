FROM oven/bun:latest AS base
LABEL authors="aeckenberg"
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y bash curl && curl -1sLf \
'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | bash \
&& apt-get update && apt-get install -y infisical

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bunx prisma generate
RUN bun test
RUN bun run build

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=build /usr/src/app/prisma .
COPY --from=build /usr/src/app/dist/ .
COPY --from=build /usr/src/app/package.json .
COPY .infisical.json .

RUN chown -R bun .
RUN bunx prisma generate

USER bun
EXPOSE 4040/tcp
ENV INFISICAL_ENV=prod
CMD infisical run --projectId d62d9721-fadc-402d-b882-069f1260bab5 --path "/server" --env $INFISICAL_ENV --token $INFISICAL_TOKEN -- bun run main.js
