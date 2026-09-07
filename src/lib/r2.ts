import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 (S3-compatible) client — used for the media library.
 * Uploads are presigned server-side; files go browser → R2 directly,
 * keeping large media off the serverless function payload.
 */

let cached: S3Client | undefined;

export function r2(): S3Client {
  if (!cached) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "R2 is not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY"
      );
    }
    cached = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return cached;
}

export function r2Bucket(): string {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET is not set");
  return bucket;
}

/** Presigned PUT URL (valid 10 min) for a direct browser upload. */
export async function presignUpload(key: string, contentType: string): Promise<string> {
  const cmd = new PutObjectCommand({ Bucket: r2Bucket(), Key: key, ContentType: contentType });
  return getSignedUrl(r2(), cmd, { expiresIn: 600 });
}

/** Public URL of an object (requires the bucket's public r2.dev/custom domain). */
export function publicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) throw new Error("R2_PUBLIC_BASE_URL is not set (bucket public domain)");
  return `${base.replace(/\/$/, "")}/${key}`;
}
