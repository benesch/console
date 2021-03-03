FROM node:14

WORKDIR /code

COPY package.json package-lock.json /code/
RUN npm install

CMD ["npm", "run", "start"]
