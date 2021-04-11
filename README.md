# Task of BeCoder Hackaton

Task done by Not So Serious team

Application requires Imagemagick CLI [installed](https://imagemagick.org/script/download.php) and written in `$PATH` environment variables.

### Install dependencies

```bash
$ npm install
```

### Get an image meta data

```bash
$ node ./index.js "/data/image.HEIC"
```

### Resize an image

```bash
$ node ./index.js -w 1000 -h 500 "/data/image.HEIC"
```

### Get city by an image meta data

```bash
$ node ./index.js -с "/data/image.HEIC"
```
