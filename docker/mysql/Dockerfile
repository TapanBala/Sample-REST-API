FROM mysql:5.6

LABEL maintainer="Tapan Bala <tapanbala007@gmail.com>"

ENV HIST_FILE /root/.bash_history
ENV MYSQL_ROOT_PASSWORD root
ENV MYSQL_DATABASE bank

COPY init.sql /docker-entrypoint-initdb.d/init.sql

CMD ["mysqld", "--general-log=1", "--general-log-file=/var/log/mysql/general.log"]
