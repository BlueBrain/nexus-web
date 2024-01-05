FROM timbru31/node-alpine-git:20 as builder

WORKDIR /tmp/nexus-web
COPY . /tmp/nexus-web
RUN yarn
RUN NODE_OPTIONS=--max-old-space-size=8192 yarn build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /opt/nexus
COPY --from=builder /tmp/nexus-web/dist /opt/nexus/dist
EXPOSE 8000
ENTRYPOINT ["node", "dist"]