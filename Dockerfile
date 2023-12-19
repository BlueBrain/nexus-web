FROM timbru31/node-alpine-git:16 as builder

WORKDIR /tmp/nexus-web

# Copy package files and install dependencies first for caching
COPY package.json yarn.lock /tmp/nexus-web/
RUN yarn

# Copy the rest of the project files
COPY . /tmp/nexus-web

ENV GENERATE_SOURCEMAP=false
RUN yarn --max-old-space-size=6144 build

FROM node:16-alpine
WORKDIR /opt/nexus
COPY --from=builder /tmp/nexus-web/dist /opt/nexus
EXPOSE 8000
ENTRYPOINT ["node", "server.js"]
