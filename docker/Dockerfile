FROM nginx:stable-alpine

# Put our build artifact and custom conf in the right places
RUN chgrp -R 0 /var/cache/nginx && chmod g+wx /var/cache/nginx
RUN ln -sf /dev/stdout /var/log/nginx/access.log && ln -sf /dev/stderr /var/log/nginx/error.log
RUN touch /var/run/nginx.pid && chgrp 0 /var/run/nginx.pid && chmod g+rwx /var/run/nginx.pid

# Prepare nginx configuration for environment substitution at runtime
WORKDIR /etc/nginx
COPY docker/nginx.conf ./
RUN chgrp 0 nginx.conf && chmod g+w nginx.conf
RUN cp -a nginx.conf nginx.conf.template

# Put app files in the right place
WORKDIR /usr/share/nginx/html
COPY dist .

# Prepare application files for environment substitution at runtime
RUN chgrp 0 index.html && chmod g+w index.html
RUN cp -a index.html index.html.template

# Default values for environment variables
ENV BASE_PATH="/staging/explorer"
ENV BASE_URI="https://bbp-nexus.epfl.ch/staging"

CMD ["/bin/sh","-c","envsubst '$BASE_PATH' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf \
    && envsubst '$BASE_URI $BASE_PATH' < index.html.template > index.html \
    && nginx -g 'daemon off;'"]

EXPOSE 8000
