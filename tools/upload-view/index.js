const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { ZipFile } = require('@arkiv/zip');
const { CognitoIdentityClient } = require("@aws-sdk/client-cognito-identity");
const { fromCognitoIdentityPool } = require('@aws-sdk/credential-provider-cognito-identity');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { existsSync, readFileSync, lstatSync } = require('fs');

const isDir = (s) => lstatSync(s).isDirectory();

(async () => {
  console.log('Upload view to amazon s3');

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

  const dist = path.join(target, 'dist');
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

  const buffer = ZipFile.CreateBufferFromDirectory(dist);

  console.log('Create archive from destination');

  console.log(`Target bucket:`, process.env.S3BUCKET);

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3BUCKET,
    Key: `views/sopia-view-${package.version}.zip`,
    Body: buffer.Stream,
  }));

  console.log(`Start patch latest version`);

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3BUCKET,
    Key: `views/latest.json`,
    Body: JSON.stringify({
      version: package.version,
    }),
  }));

  console.log(`Upload complete.`);
  
})();