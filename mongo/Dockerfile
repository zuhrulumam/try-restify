FROM mongo:3.4

COPY ./createUser.sh /docker-entrypoint-initdb.d/

RUN chown -R mongodb:mongodb /var/log /data/db 

USER mongodb