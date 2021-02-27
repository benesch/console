FROM node:14

WORKDIR /srv/frontend

COPY package.json package-lock.json /srv/frontend/
RUN npm install

COPY . /srv/frontend

EXPOSE 3000
CMD "./entrypoint.sh"
