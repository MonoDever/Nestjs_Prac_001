FROM node:18

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

ENV NODE_ENV develop

CMD ["yarn","start"]
# CMD [ "node", "dist/src/main.js" ]

EXPOSE 3005