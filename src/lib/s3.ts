import { S3Client } from "@aws-sdk/client-s3";

const s3Region = process.env.S3_REGION || "us-east-1";

const s3Credentials = {
  accessKeyId: process.env.S3_ACCESS_KEY!,
  secretAccessKey: process.env.S3_SECRET_KEY!,
};

export const s3Endpoint = process.env.S3_ENDPOINT!;
export const s3PublicEndpoint = process.env.S3_PUBLIC_ENDPOINT || s3Endpoint;

export const s3Client = new S3Client({
  endpoint: s3Endpoint,
  region: s3Region,
  credentials: s3Credentials,
  forcePathStyle: true,
});

export const s3PublicClient =
  s3PublicEndpoint === s3Endpoint
    ? s3Client
    : new S3Client({
        endpoint: s3PublicEndpoint,
        region: s3Region,
        credentials: s3Credentials,
        forcePathStyle: true,
      });

export const s3BucketName = process.env.S3_BUCKET_NAME!;
