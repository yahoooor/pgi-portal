#! /bin/bash

docker build -t inspire-validator:latest -f ./pgi-backend/Dockerfile ./pgi-backend
docker image tag inspire-validator:latest localhost:5000/inspire-validator:latest
docker image push localhost:5000/inspire-validator:latest

docker build -t inspire-portal:latest -f ./portal-pgi/Dockerfile ./portal-pgi
docker image tag inspire-portal:latest localhost:5000/inspire-portal:latest
docker image push localhost:5000/inspire-portal:latest