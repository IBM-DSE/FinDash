FROM node:8

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build_client

EXPOSE 3000
CMD [ "npm", "start" ]