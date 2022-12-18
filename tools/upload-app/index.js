const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
const { CognitoIdentityClient } = require("@aws-sdk/client-cognito-identity");
const { fromCognitoIdentityPool } = require('@aws-sdk/credential-provider-cognito-identity');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { existsSync, readFileSync, lstatSync } = require('fs');
const yaml = require('js-yaml');
const crypto = require('crypto');

const isDir = (s) => lstatSync(s).isDirectory();
const getSize = (s) => lstatSync(s).size;
const SHA512 = (t) => crypto.createHash('sha512').update(t).digest('base64');


(async () => {
  console.log('Upload app to amazon s3');

  const target = path.join(process.cwd(), process.argv[2] || '');
  if ( !existsSync(target) ) {
    throw new Error(`Cannot access dirctory ${target}`);
  }
  
  console.log('Project directory', target);

  const packageTarget = path.join(target, 'package.json');
  if ( !existsSync(packageTarget) ) {
    throw new Error(`Cannot access package ${packageTarget}`);
  }

  const package = JSON.parse(readFileSync(packageTarget, 'utf-8'));

  console.log('Read package', package.name, package.version);

  const dist = path.join(target, 'dist_electron');
  if ( !existsSync(dist) || !isDir(dist) ) {
    throw new Error(`Cannot access dist directory ${dist}`);
  }

  console.log('Destination directory', dist);
  
  const s3 = new S3Client({
    region: process.env.S3REGION,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: process.env.S3REGION }),
      identityPoolId: process.env.IDENTITY_POOL_ID,
    }),
  });

  console.log('Create s3 client');

  const buildJson = require(path.join(target, 'electron.build.json'));
  const excute = `${buildJson.productName}-${package.version}.exe`;
  const excuteTarget = path.join(dist, excute);

  if ( !existsSync(excuteTarget) ) {
    throw new Error(`No such file or directory ${excuteTarget}`);
  }

  const blockMap = `${excute}.blockmap`;
  const blockMapTarget = path.join(dist, blockMap);

  if ( !existsSync(blockMapTarget) ) {
    throw new Error(`No such file or directory ${blockMapTarget}`);
  }

  const excuteBody = readFileSync(excuteTarget);

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3BUCKET,
    Key: excute,
    Body: excuteBody,
    ACL: 'public-read',
  }));

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3BUCKET,
    Key: blockMap,
    Body: readFileSync(blockMapTarget),
    ACL: 'public-read',
  }));

  console.log(`Upload success excute target: ${excuteTarget}`);

  console.log(`Start patch latest version`);

  const excuteSHA512 = SHA512(excuteBody);
  const latest = {
    version: package.version,
    files: [
      {
        url: excute,
        sha512: excuteSHA512,
        size: getSize(excuteTarget),
      },
    ],
    path: excute,
    sha512: excuteSHA512,
    releaseDate: new Date().toJSON(),
  };

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3BUCKET,
    Key: `latest.yml`,
    Body: yaml.dump(latest),
    ACL: 'public-read',
  }));
  console.log(yaml.dump(latest));

  console.log(`Upload complete.`);
  
})();