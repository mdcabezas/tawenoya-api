const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: getAwsSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  endpoint: process.env.SEAWEEDFS_ENDPOINT || 'http://localhost:8333',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.SEAWEEDFS_ACCESS_KEY || 'tawenoya',
    secretAccessKey: process.env.SEAWEEDFS_SECRET_KEY || 'tawenoya-secret',
  },
  forcePathStyle: true,
});

const BUCKET = process.env.SEAWEEDFS_BUCKET || 'reports';

async function uploadFile(key, buffer, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return `${process.env.SEAWEEDFS_PUBLIC_URL || 'http://localhost:8333'}/${BUCKET}/${key}`;
}

async function deleteFile(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

async function generateSignedUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getAwsSignedUrl(s3Client, command, { expiresIn });
}

module.exports = { uploadFile, deleteFile, generateSignedUrl };
