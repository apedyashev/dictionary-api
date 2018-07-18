#!/bin/bash

git pull origin production

cd ./api
yarn install
NODE_ENV=prodiction npm run migrate

cd ./queue
yarn install
