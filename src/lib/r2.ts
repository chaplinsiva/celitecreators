/* agent-notes: { ctx: "Cloudflare R2 presigned URL upload & download delivery helper", deps: ["@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner", src/types/marketplace.ts], state: active, last: "archie@2026-07-23" } */

import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'mock_account_id';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'mock_access_key';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || 'mock_secret_key';

const PUBLIC_BUCKET_NAME = process.env.R2_PUBLIC_BUCKET || 'celite-public';
const PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET || 'celite-private';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Generates a server-side presigned download URL for private source files with 15-minute TTL
 * Implements ADR-0003 (15-min download URL expiry for Zero Egress & Link Leak protection)
 */
export async function getPresignedDownloadUrl(
  sourcePathKey: string,
  expiresInSeconds: number = 900 // 15 minutes = 900 seconds
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: PRIVATE_BUCKET_NAME,
    Key: sourcePathKey,
  });

  return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generates a server-side presigned upload URL for direct creator zip file upload to R2
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string = 'application/zip',
  expiresInSeconds: number = 1800 // 30 minutes
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: PRIVATE_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}
