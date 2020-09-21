# Sample REST Bank API for Godfather

## Overview
A sample RESTful API made in Node.js using [swagger-codegen](https://github.com/swagger-api/swagger-codegen).

It uses node 12 along with mysql 5.6 for the database.

It is a basic API to showcase bank transactions between members of Corleone Family including some rivals.

### Running the server
* MySQL

For using the included dummy data please import DB:
```
mysql -uroot -proot bank < /docker/mysql/init.sql
```

* Server

To run the server, run:

```
npm start
```

To view the Swagger UI interface:

```
open http://localhost:8080/docs
```

* Config

As a default I have used the following ENV variables, Do update as required.\

1. PORT: `8080`
2. DB_HOST: `localhost`
3. DB_USER: `root`
4. DB_PASSWORD: `root`
5. DB: `bank`

* Docker

If you have docker setup, you only have to run composer up to get everything running.
```
docker-compose up -d
```
For MySQL console run:
```
docker exec -it mysql mysql -uroot -proot bank
```
The API is accessible at `http://localhost:8080` 
and the API documentation can be viewed via Swagger-ui, 
available at `http://localhost:8080/docs`

