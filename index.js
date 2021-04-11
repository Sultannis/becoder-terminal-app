const path = require("path");
const imagemagick = require("imagemagick");
const nodeGeocoder = require("node-geocoder");

const main = () => {
  const arguments = process.argv.slice(2);
  const [firstArg, secondArg, thirdArg, fourthArg, fifthArg] = arguments;

  if (firstArg === "-w" && thirdArg === "-h") {
    resizeImage(secondArg, fourthArg, fifthArg);
  } else if (firstArg === "-c" || firstArg === "--city") {
    displayCity(secondArg);
  } else {
    displayMetaData(firstArg);
  }
};

const displayMetaData = (imgPath) => {
  const srcPath = path.join(__dirname, imgPath);
  imagemagick.readMetadata(srcPath, (error, metaData) => {
    if (error) throw error;
    const latitudeValues = metaData.exif.gpsLatitude.split(",");
    const longitudeValues = metaData.exif.gpsLongitude.split(",");
    const latitude = calculateGpsValues(latitudeValues);
    const longitude = calculateGpsValues(longitudeValues);

    console.log(`lat: ${latitude}`);
    console.log(`lon: ${longitude}`);
  });
};

const calculateGpsValues = (values) => {
  const parsedValues = values.map((value) => {
    const [numerator, denominator] = value.split("/");
    return parseInt(numerator) / parseInt(denominator);
  });
  const [degrees, minutes, seconds] = parsedValues;
  const value = degrees + minutes / 60 + seconds / 3600;

  return value;
};

const resizeImage = (width, height, imgPath) => {
  const srcPath = path.resolve(__dirname + imgPath);
  const [filePath, fileExtencion] = srcPath.split(".");
  const redizedFilePath = `${filePath}_resized`;
  const dstPath = path.resolve(`${redizedFilePath}.${fileExtencion}`);

  imagemagick.resize({ srcPath, dstPath, width, height }, (err) => {
    if (err) throw err;
    imagemagick.identify(dstPath, (error, info) => {
      if (error) throw error;
      console.log(info.filesize);
    });
  });
};

const displayCity = (imgPath) => {
  const options = {
    provider: "yandex",
    httpAdapter: "https",
    apiKey: "9e282b5f-f010-4230-a264-56d192576794",
    formatter: "json",
  };
  const geocoder = nodeGeocoder(options);
  const srcPath = path.resolve(__dirname + imgPath);

  imagemagick.readMetadata(srcPath, (error, metaData) => {
    if (error) throw error;

    const latitudeValues = metaData.exif.gpsLatitude.split(",");
    const longitudeValues = metaData.exif.gpsLongitude.split(",");
    const latitude = calculateGpsValues(latitudeValues);
    const longitude = calculateGpsValues(longitudeValues);

    geocoder.reverse(
      { lat: `${latitude}`, lon: `${longitude}` },
      (err, res) => {
        if (err) throw error;
        console.log(res[0].city);
      }
    );
  });
};

main();
