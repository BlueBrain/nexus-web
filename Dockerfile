FROM timbru31/node-alpine-git as builder

WORKDIR /tmp/nexus-web
COPY . /tmp/nexus-web
RUN yarn && yarn --max-old-space-size=6144 build

FROM node:18-alpine
WORKDIR /opt/nexus
COPY --from=builder /tmp/nexus-web/dist /opt/nexus
ENV NODE_ENV=production
EXPOSE 8000
ENTRYPOINT ["node", "server"]
