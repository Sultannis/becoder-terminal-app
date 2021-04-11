const path = require("path");
const imagemagick = require("imagemagick");
const nodeGeocoder = require("node-geocoder");

const main = () => {
  const arguments = process.argv.slice(2);
  const [firstArg, secondArg, thirdArg, fourthArg, fifthArg] = arguments;
  if (firstArg === "-w" && thirdArg === "-h") {
    handleImageResize(secondArg, fourthArg, fifthArg);
  } else if (firstArg === "-с" || firstArg === "--city") {
    handleLogCity(secondArg);
  } else {
    handleLogMetaData(firstArg);
  }
};

const handleImageResize = async (width, height, imagePath) => {
  const source = path.join(__dirname, imagePath);
  const [name, extension] = source.split(".");
  const resizedImageName = `${name}_resized`;
  const outputImagePath = path.resolve(`${resizedImageName}.${extension}`);

  const outputFilePath = await resizeImage(
    source,
    outputImagePath,
    width,
    height
  );
  const outputFileSize = await getImageSize(outputFilePath);
  const formattedImageSize = formatImageSize(outputFileSize);

  console.log(formattedImageSize);
};

const resizeImage = (source, output, width, height) => {
  return new Promise((resolve, reject) => {
    imagemagick.resize(
      { srcPath: source, dstPath: output, width, height },
      (error) => {
        if (error) reject(error);
        resolve(output);
      }
    );
  });
};

const getImageSize = (source) => {
  return new Promise((resolve, reject) => {
    imagemagick.identify(source, (error, info) => {
      if (error) reject(error);
      resolve(info.filesize);
    });
  });
};

const formatImageSize = (size) => {
  return String(size).slice(0, -1);
};

const handleLogCity = async (imagePath) => {
  const source = path.join(__dirname, imagePath);
  const { lat, lon } = await getLocationMetaData(source);
  const city = await getCityNameByLocation(lat, lon);

  console.log(city);
};

const getCityNameByLocation = (lat, lon) => {
  const options = {
    provider: "yandex",
    httpAdapter: "https",
    apiKey: "9e282b5f-f010-4230-a264-56d192576794",
    formatter: "json",
  };
  const geocoder = nodeGeocoder(options);

  return new Promise((resolve, reject) => {
    geocoder.reverse({ lat: `${lat}`, lon: `${lon}` }, (error, res) => {
      if (error) reject(error);

      const cityName = res[0].city;
      resolve(cityName);
    });
  });
};

const handleLogMetaData = async (imagePath) => {
  const source = path.join(__dirname, imagePath);
  const { lat, lon } = await getLocationMetaData(source);

  console.log(`lat: ${lat}`);
  console.log(`lon: ${lon}`);
};

const getLocationMetaData = (source) => {
  return new Promise((resolve, reject) => {
    imagemagick.readMetadata(source, (error, meta) => {
      if (error) {
        reject(error);
      }

      const lat = meta.exif.gpsLatitude.split(",");
      const lon = meta.exif.gpsLongitude.split(",");
      const parsedLat = parseGPSLocation(lat);
      const parsedLon = parseGPSLocation(lon);

      resolve({ lat: parsedLat, lon: parsedLon });
    });
  });
};

const parseGPSLocation = (values) => {
  const parsedValues = values.map((value) => {
    const [numerator, denominator] = value.split("/");
    return parseInt(numerator) / parseInt(denominator);
  });
  const [degrees, minutes, seconds] = parsedValues;
  const value = degrees + minutes / 60 + seconds / 3600;

  return value;
};

main();
