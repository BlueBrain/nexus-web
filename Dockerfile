FROM timbru31/node-alpine-git:16 as builder

WORKDIR /tmp/nexus-web
COPY . /tmp/nexus-web
ENV GENERATE_SOURCEMAP=false
RUN npm install -g yarn@1.22.19
RUN yarn && yarn --max-old-space-size=6144 build

FROM node:16-alpine
WORKDIR /opt/nexus
COPY --from=builder /tmp/nexus-web/dist /opt/nexus
EXPOSE 8000
ENTRYPOINT ["node", "server.js"]
