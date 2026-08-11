import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export type S3UploadConfig = {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Optional CDN / custom public base. Defaults to virtual-hosted–style S3 URL. */
  publicUrlBase?: string;
};

export function getS3UploadConfig(): S3UploadConfig | null {
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const publicUrlBase = process.env.S3_PUBLIC_URL_BASE;

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicUrlBase: publicUrlBase || undefined,
  };
}

function createS3Client(config: S3UploadConfig) {
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function buildPublicUrl(config: S3UploadConfig, key: string): string {
  if (config.publicUrlBase) {
    return `${config.publicUrlBase.replace(/\/$/, '')}/${key}`;
  }

  return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;
}

export async function uploadBufferToS3(options: {
  config: S3UploadConfig;
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  const { config, key, body, contentType } = options;
  const client = createS3Client(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return buildPublicUrl(config, key);
}
