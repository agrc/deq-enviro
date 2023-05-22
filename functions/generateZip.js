import { queryFeatures } from '@esri/arcgis-rest-feature-service';
import { getStorage } from 'firebase-admin/storage';
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from 'fs';
import gdal from 'gdal-async';
import JSZip from 'jszip';
import { downloadFormats } from './common/config.js';

async function downloadLayer(layer, folder) {
  console.log(`querying ${layer.name}...`);
  // execute query against feature service
  const geojson = await queryFeatures({
    url: layer.featureService,
    objectIds: layer.objectIds,
    f: 'geojson',
    returnGeometry: true,
    outFields: '*',
  });

  // write geojson to temp file
  const filePath = `${folder}/${layer.name
    .split(' ')
    .join('')}_${Date.now()}.geojson`;
  writeFileSync(filePath, JSON.stringify(geojson));

  return filePath;
}

function convert(geojsonPath, format) {
  console.log(`converting ${geojsonPath} to ${format}...`);
  const dataset = gdal.open(geojsonPath);
  let driver;
  let fileExtension;
  switch (format) {
    case downloadFormats.shapefile:
      driver = gdal.drivers.get('ESRI Shapefile');
      fileExtension = 'shp';
      break;

    case downloadFormats.csv:
      driver = gdal.drivers.get('CSV');
      fileExtension = 'csv';
      break;

    case downloadFormats.filegdb:
      // this is not working ref: https://github.com/mmomtchev/node-gdal-async/issues/84
      driver = gdal.drivers.get('OpenFileGDB');
      fileExtension = 'gdb';
      break;

    default:
      throw new Error(`Unknown format: ${format}`);
  }

  const outputPath = geojsonPath.replace('.geojson', `.${fileExtension}`);
  driver.createCopy(outputPath, dataset).close();
  rmSync(geojsonPath);
}

export default async function generateZip({ layers, format }) {
  const folder = `/tmp/${Date.now()}`;
  await mkdirSync(folder);

  let zipFile;
  try {
    // download layers as geojson concurrently
    const geojsonPaths = await Promise.all(
      layers.map((layer) => downloadLayer(layer, folder))
    );

    if (format !== downloadFormats.geojson) {
      for (const path of geojsonPaths) {
        convert(path, format);
      }
    }

    // zip all contents in folder
    console.log(`zipping ${folder}...`);
    const zip = new JSZip();
    for (const file of readdirSync(folder)) {
      console.log('file', file);
      zip.file(file, readFileSync(`${folder}/${file}`));
    }

    // upload to storage
    const bucket = getStorage().bucket();
    zipFile = bucket.file(`${Date.now()}/${format}.zip`);
    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(
      zipFile.createWriteStream({
        resumable: false,
      })
    );
  } finally {
    // delete temp files even if an error was thrown
    rmdirSync(folder, { recursive: true });
  }

  return zipFile.publicUrl();
}
