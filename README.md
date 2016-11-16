Install tesseract

```sh
sudo apt-get install tesseract-ocr
```
or
```sh
brew install tesseract
```

tesseract database

```sh
wget https://github.com/tesseract-ocr/tessdata/archive/master.zip  -O  tessdata.zip
unzip tessdata.zip
rm tessdata.zip
mv tessdata-* tessdata
```

Test command line:
```sh
export TESSDATA_PREFIX=/.../my_ocr/tessdata
tesseract  --tessdata-dir ./tessdata/ ./example/IMG_3336.png stdout -l fra -psm 0
```

Install tika

```sh
wget http://apache.crihan.fr/dist/tika/tika-app-1.14.jar
```

Test command line:
```sh
java -jar tika-app-1.13.jar -t ./example/*.pdf
```

Start server
```sh
node server/index.js
```

Test API:
```sh
curl -i -F token=[my_token] \
-F file=@[file_path] \
-F file=@[file_path] \
-F file=@[file_path] \
localhost:3000/api/text
```

TODO:
- dockerfile
- perform ui
- perform search nGram
- add exif (http://www.exif.org/)
