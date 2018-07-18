#!/bin/bash

git pull origin production

cd ./api
yarn install
npm run migrate

cd ./queue
yarn install
