FROM node:carbon-alpine

ADD . /home/nobody/app

RUN chown -R nobody /home/nobody

USER nobody
ENV HOME /home/nobody

WORKDIR /home/nobody/app

ENV NODE_ENV production
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]