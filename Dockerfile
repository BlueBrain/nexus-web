FROM timbru31/node-alpine-git as builder

WORKDIR /tmp/nexus-web
COPY . /tmp/nexus-web
RUN yarn && yarn --max-old-space-size=6144 build

FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /opt/nexus
COPY --from=builder /tmp/nexus-web/dist /opt/nexus/dist
EXPOSE 8000
ENTRYPOINT ["node", "dist/server"]
