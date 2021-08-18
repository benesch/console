# Development Docker image for the frontend.
#
# There is some trickery required for proper handling of NPM packages. We need
# to bake the NPM packages into the Docker image, and trigger a rebuild whenever
# the package.json or package-lock.json files change. But we also need to
# mount the repository at /code, and that mounts any node_modules directory
# that may be present on the host. These modules may include binaries that were
# built for the host architecture and won't work in Docker.
#
# There's no way to exclude a directory from a mount, so we instead mount a
# blank volume atop /code/frontend/node_modules. Then, here, we install the
# NPM packages into /node_modules. When Node resolves modules, it will recurse
# up the directory hierarchy until it finds the packages in /node_modules.

FROM node:16.2.0-buster AS frontend

# Install Puppeteer and configure it for use in Docker.
# See: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker
#
# We have to symlink the binary as /usr/bin/chromium-browser because Puppeteer
# hardcodes that path on ARM (!).
# See: https://github.com/puppeteer/puppeteer/issues/6641
RUN apt-get update \
    && apt-get install -y chromium iproute2 --no-install-recommends \
    && ln -s /usr/bin/chromium /usr/bin/chromium-browser \
    && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_BROWSER_ARGS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"
ENV CONSOLE_ADDR=http://backend:8000/

COPY package.json package-lock.json /
RUN npm install && rm package.json package-lock.json

WORKDIR /code/frontend
ENV PATH=$PATH:/node_modules/.bin

ENTRYPOINT ["/code/misc/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
