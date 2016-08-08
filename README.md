


Install tesseract

```sh
sudo apt-get install tesseract-ocr

brew install tesseract
```

```sh
wget https://github.com/tesseract-ocr/tessdata/archive/master.zip  -O  tessdata.zip
unzip tessdata.zip
rm tessdata.zip
mv tessdata-* tessdata
```

Command line:
```sh
export TESSDATA_PREFIX=/home/laurent/Git/my_ocr/tessdata
tesseract  --tessdata-dir ./tessdata/ ./example/IMG_3336.png stdout -l fra -psm 0
```




TODO:
- dockerfile
- add tike -> pdf, word, ... files


Test API:
```sh
curl -i -F token=[my_token] \
-F file=@[file_path] \
-F file=@[file_path] \
-F file=@[file_path] \
localhost:3000/api/parse
```

