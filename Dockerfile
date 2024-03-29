FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install && npm install typescript -g

COPY . .

RUN npm run build

CMD [ "npm", "start" ]

