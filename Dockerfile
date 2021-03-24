FROM node:14

WORKDIR /code/frontend

COPY package.json package-lock.json /code/frontend/
RUN npm install

CMD ["npm", "run", "start"]
