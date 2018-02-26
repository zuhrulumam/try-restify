# Trying Restify

## Run In Development

* Build
  docker build -t umam/restify-try:latest -f development.dockerfile .

- Run
  docker run -p 3000:3000 --env-file web.env -v $(pwd)/node_modules:/home/nobody/app/node_modules -v $(pwd):/home/nobody/app/ umam/restify-try:dev

## CHANGELOGS

### Day 1

* hello world
* docker image build and run (development with pm2)
* send email

[Visit Team Website](https://archipelago-ds.com)
