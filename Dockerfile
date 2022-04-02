FROM node:current

WORKDIR /usr/src/transplace-defender
RUN mkdir build

COPY package.json .
COPY ./.npmrc .

RUN yarn install

COPY . .

RUN yarn tsc

CMD node ./build/bot.js
