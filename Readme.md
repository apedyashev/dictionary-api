# Important: you need Docker to run the app

## Useful links
* Rockmongo: http://localhost:8081/
* Documentation: http://localhost:8080/
* Redis Commander: http://localhost:8095/

## Deploy links
https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04
http://pm2.keymetrics.io/docs/usage/environment/
http://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/

### Create migration
```
docker-compose run api npm run migrate create seed-countries
```

### 1. Running in development
```
    git clone https://github.com/apedyashev/usecases-app.git
    cd usecases-app
    docker-compose build
```

### 2. install dependencies in *API* container:
```
	docker-compose run api npm install
```

### 3. seed data:
```
	docker-compose run api npm run migrate
```

### 4. run the app:
```
	docker-compose up
```

### 5. Open http://localhost:3001/ in your browser


## Additional commands
### Run tests
```
	docker-compose run api npm run test
```

### Migrations (More info: https://github.com/tj/node-migrate)
```
docker-compose run api npm run migrate [create <name>]
```

### Run prettier to format code
```
docker-compose run api npm run prettier
```

### Lint API code
```
	docker-compose run api npm run lint
```
