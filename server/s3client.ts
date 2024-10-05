import { S3Client } from '@aws-sdk/client-s3';

const { accountId, accessKeyId, secretAccessKey } = useRuntimeConfig().cloudflare;
export const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});
