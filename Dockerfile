FROM node:carbon

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .

RUN npm run build_client

EXPOSE 3000
CMD [ "npm", "start" ]