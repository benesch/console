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

FROM node:14

COPY package.json package-lock.json /
RUN npm install && rm package.json package-lock.json

WORKDIR /code/frontend
ENV PATH=$PATH:/node_modules/.bin

CMD ["npm", "run", "start"]
