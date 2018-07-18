#!/bin/bash

git pull origin production

cd ./api
yarn install
NODE_ENV=production npm run migrate

cd ./queue
yarn install
