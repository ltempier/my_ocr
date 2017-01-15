FROM ubuntu:16.04

MAINTAINER Laurent Tempier

RUN apt-get update
RUN apt-get install -y supervisor wget git unzip build-essential curl

ENV NODE_VERSION 4.2.6
ENV NPM_VERSION 2.14.12

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --verify SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
  && tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc \
  && npm install -g npm@"$NPM_VERSION" \
  && npm cache clear

RUN mkdir -p /var/log/server

VOLUME /usr/src/data

ADD ./etc/supervisor/conf.d /etc/supervisor/conf.d

EXPOSE 3000

CMD [ "/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf" ]


