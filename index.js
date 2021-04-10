const path = require("path");
const imagemagick = require("imagemagick");
const util = require("util");
const nodeGeocoder = require("node-geocoder");

const main = () => {
  const arguments = process.argv.slice(2);

  if(arguments[0] === '-w' && arguments[2] === '-h') {
    size(arguments[1], arguments[3], arguments[4])
  }

  else if(arguments[0] === '-c' || arguments[0] === '--city') {
    city(arguments[1])
  }

  else {
    const meta = getMetaData(arguments[0])
    console.log(`lat: ${meta.latitude} lon: ${meta.longitude}`)
  }
};

const calculateGpsValues = (values) => {
  const value = parseFloat(values[0]) + parseFloat(values[1])/60 + parseFloat(values[2])/3600

  return value
}

const getMetaData = (imgPath) => {
  const srcPath = path.resolve(__dirname + imgPath);
  let latitude = '';
  let longitude = '';

  imagemagick.readMetadata(srcPath, (error, metaData) => {
    if (error) throw error;
    const latitudeValues = metaData.exif.gpsLatitude.split(',');
    const longitudeValues = metaData.exif.gpsLongitude.split(',');

    latitude = calculateGpsValues(latitudeValues)
    longitude = calculateGpsValues(longitudeValues)
  });

  return {latitude, longitude}
}

const size = (width, height, imgPath) => {
  const srcPath = path.resolve(__dirname + imgPath);
  const dstPath = path.resolve(__dirname + imgPath);

  imagemagick.resize({ srcPath, width, height }, (err) => {
    if (err) throw err;
    console.log(stdout)
    // console.log(util.inspect(stdout, { showHidden: false, depth: null }));
    // imagemagick.identify(dstPath, (error, info) => {
    //   if (error) throw error;
    //   console.log(info.filesize);
    // });
  });
};

const city = (imgPath) => {
  const options = {
    provider: "yandex",
    httpAdapter: "https", // Default
    apiKey: "9e282b5f-f010-4230-a264-56d192576794", // for Mapquest, OpenCage, Google Premier
    formatter: "json", // 'gpx', 'string', ...
  };

  const geocoder = nodeGeocoder(options);

  const meta = getMetaData(imgPath)
  console.log(meta.latitude)

  geocoder.reverse(
    { lat: meta.latitude, lon: meta.longitude },
    (err, res) => {
    }
  );
};

main();
