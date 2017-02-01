FROM ubuntu:16.04

MAINTAINER Laurent Tempier

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get install -y supervisor build-essential  software-properties-common  curl tesseract-ocr wget unzip

# gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

ENV NODE_VERSION 4.5.0
ENV NPM_VERSION 2.15.9
#ENV NPM_CONFIG_LOGLEVEL info

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --verify SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
  && tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc \
  && npm install -g npm@"$NPM_VERSION" \
  && npm cache clear

RUN mkdir -p /var/log/
RUN mkdir -p /usr/share/tesseract-ocr/tessdata
RUN mkdir -p /usr/share/tika
RUN mkdir -p /data

RUN  wget https://github.com/tesseract-ocr/tessdata/archive/master.zip  -O  /tmp/tessdata.zip
RUN  unzip /tmp/tessdata.zip -d /tmp
RUN  mv -u /tmp/tessdata-*/* /usr/share/tesseract-ocr/tessdata/
RUN  rm -rf /tmp/tessdata*

ENV TIKA_VERSION 1.14

RUN wget "http://apache.crihan.fr/dist/tika/tika-app-$TIKA_VERSION.jar" -O  /usr/share/tika/tika-app.jar

ADD ./etc/supervisor/conf.d /etc/supervisor/conf.d

CMD [ "/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf" ]

