SHELL := /bin/bash

.PHONY: install dev build test lint seed migrate up down logs

install:
	npm install

dev:
	npm run start:dev

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

seed:
	npm run seed

migrate:
	npm run prisma:migrate

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f api
