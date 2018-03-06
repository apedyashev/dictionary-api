FROM node:9-alpine

RUN mkdir /src
ADD ./ /src
WORKDIR /src
#COPY package.json .
# RUN npm install
RUN npm install -g yarn
RUN npm install -g nodemon
