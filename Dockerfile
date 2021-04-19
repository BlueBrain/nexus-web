FROM tarampampam/node:15-alpine as builder

WORKDIR /tmp/nexus-web
COPY . /tmp/nexus-web
RUN yarn  --ignore-engines && yarn build

FROM node:10-alpine
WORKDIR /opt/nexus
COPY --from=builder /tmp/nexus-web/dist /opt/nexus
EXPOSE 8000
ENTRYPOINT ["node", "server.js"]
