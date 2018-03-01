FROM node:carbon-alpine

COPY package.json /home/nobody/app/
COPY process.dev.json /home/nobody/app/
ADD . /home/nobody/app

RUN chown -R nobody /home/nobody

RUN npm install -g pm2

USER nobody
ENV HOME /home/nobody

WORKDIR /home/nobody/app

ENV NODE_ENV development
RUN npm install

EXPOSE 3000

CMD ["pm2-dev", "process.dev.json"]