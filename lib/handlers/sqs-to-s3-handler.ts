import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { SQSBatchItemFailure, SQSBatchResponse, SQSEvent } from 'aws-lambda';

const s3Client = new S3Client();

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const bucketName = process.env.BUCKET_NAME;
  const batchItemFailures: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    try {
      const messageId = record.messageId;
      const sentTimestamp = record.attributes.SentTimestamp;
      const timestamp = new Date(Number(sentTimestamp)).toISOString().replace(/[:.]/g, '-');
      const key = `messages/${timestamp}_${messageId}.json`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: record.body,
          ContentType: 'application/json',
        }),
      );
    } catch (error) {
      console.error(`Failed to process message ${record.messageId}:`, error);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
