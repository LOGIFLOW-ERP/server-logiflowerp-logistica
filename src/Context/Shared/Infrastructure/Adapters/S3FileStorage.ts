import { injectable } from 'inversify'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from '@Config/env'

@injectable()
export class AdapterS3FileStorage {
    private s3: S3Client
    private bucket = env.CLOUDFLARE_BUCKET
    private accountId = env.CLOUDFLARE_ACCOUNT_ID

    constructor() {
        this.s3 = new S3Client({
            region: "auto",
            endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
                secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
            },
        });
    }

    async upload(file: Express.Multer.File, options: { folder: string }) {
        const key = `${options.folder}/${Date.now()}-${file.originalname}`

        await this.s3.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            })
        );

        const url = `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucket}/${key}`

        return { url, key }
    }

    async delete(key: string) {
        await this.s3.send(
            new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            })
        )
    }
}
