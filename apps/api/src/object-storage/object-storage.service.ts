import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { randomUUID } from "node:crypto"
import * as path from "node:path"

@Injectable()
export class ObjectStorageService implements OnModuleInit {
  private readonly logger = new Logger(ObjectStorageService.name)
  private readonly s3: S3Client
  private readonly bucket: string

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>("S3_ENDPOINT")
    this.bucket = this.configService.getOrThrow<string>("S3_BUCKET")

    this.s3 = new S3Client({
      endpoint,
      region: this.configService.get<string>("S3_REGION", "ap-northeast-2"),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>("S3_ACCESS_KEY"),
        secretAccessKey: this.configService.getOrThrow<string>("S3_SECRET_KEY")
      },
      forcePathStyle: endpoint ? true : false,
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED"
    })
  }

  async onModuleInit() {
    try {
      await this.ensureBucket()
      await this.configureBucketPolicy()
      await this.configureCors()
      this.logger.log("Object storage initialized successfully")
    } catch (error) {
      this.logger.warn(
        `Object storage initialization failed: ${error}. ` +
          `Create bucket "${this.bucket}" manually via Minio Console (http://localhost:9001) if needed.`
      )
    }
  }

  async getPresignedUploadUrl(
    folder: string,
    filename: string,
    contentType: string
  ) {
    const ext = path.extname(filename)
    const key = `${folder}/${randomUUID()}${ext}`

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType
    })

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 })
    const publicUrl = this.generatePublicUrl(key)

    return { uploadUrl, publicUrl }
  }

  async deleteObject(url: string) {
    try {
      const key = this.extractKeyFromUrl(url)

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      })

      await this.s3.send(command)
      this.logger.log(`Object "${key}" deleted successfully`)
    } catch (error) {
      this.logger.error(`Failed to delete object "${url}":`, error)
      throw error
    }
  }

  private extractKeyFromUrl(url: string) {
    try {
      const parsedUrl = new URL(url)
      const pathName = parsedUrl.pathname

      const endpoint = this.configService.get("S3_ENDPOINT")
      if (endpoint) {
        const bucketPath = `/${this.bucket}/`

        if (pathName.startsWith(bucketPath))
          return decodeURIComponent(pathName.replace(bucketPath, ""))
      }

      return decodeURIComponent(pathName.substring(1))
    } catch (error) {
      this.logger.error(`Invalid URL format: ${url}`, error)
      throw error
    }
  }

  private generatePublicUrl(key: string) {
    const endpoint = this.configService.get<string>("S3_ENDPOINT")
    const region = this.configService.get<string>("S3_REGION", "ap-northeast-2")

    if (endpoint) {
      return `${endpoint}/${this.bucket}/${key}`
    }

    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`
  }

  private async ensureBucket() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }))
      this.logger.log(`Bucket "${this.bucket}" exists`)
    } catch {
      this.logger.log(`Creating bucket "${this.bucket}"...`)
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }))
      this.logger.log(`Bucket "${this.bucket}" created`)
    }
  }

  private async configureBucketPolicy() {
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${this.bucket}/*`]
        }
      ]
    }

    await this.s3.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify(policy)
      })
    )
  }

  private async configureCors() {
    const isProduction = this.configService.get("NODE_ENV") === "production"
    const allowedOrigins = isProduction
      ? ["https://json-server.win", "https://*.json-server.win"]
      : ["*"]

    await this.s3.send(
      new PutBucketCorsCommand({
        Bucket: this.bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["PUT", "GET"],
              AllowedOrigins: allowedOrigins,
              ExposeHeaders: []
            }
          ]
        }
      })
    )
  }
}
