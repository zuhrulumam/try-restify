# Trying Restify

## Run In Development

* Build Restify
  `docker build -t umam/restify-try:latest -f development.dockerfile .`

* Build Mongo
  `docker build -t umam/restify-mongo -f mongo/Dockerfile .`

* Run Mongo
  `docker run -p 27017:27017 --rm --env-file mongo/auth.env --name mongorestify umam/restify-mongo`

* Run Node
  `docker run -p 3000:3000 --rm --env-file web.env --link mongorestify:mongodb -v $(pwd)/node_modules:/home/nobody/app/node_modules -v $(pwd):/home/nobody/app/ umam/restify-try:dev`

**CHANGELOGS**

### Day 1

* hello world
* docker image build and run (development with pm2)
* send email

### Day 2

* mongodb
* docker image build mongodb
* connect restify with mongodb
* create schema
* insert row

[Visit Team Website](https://archipelago-ds.com)
