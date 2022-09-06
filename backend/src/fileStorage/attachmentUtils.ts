import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { TodoAccess } from '../dataLayer/todosAcess'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
  constructor(
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly s3Client = new XAWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly todoAccess = new TodoAccess()
  ) {}

  async getUploadUrl(userId: string, todoItemId: string) {
    const preSignedUrl = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoItemId,
      Expires: parseInt(this.urlExpiration)
    })

    await this.todoAccess.updateAttachmentUrl(userId, todoItemId, this.bucketName)

    return preSignedUrl
  }
}
