import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { S3Event } from 'aws-lambda';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

export const lambdaHandler = async (event: S3Event): Promise<void> => {
    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
        const size = record.s3.object.size;

        console.log(`Proicessing ${key}...`);

        await ddbDocClient.send(new PutCommand({
            TableName: tableName,
            Item: {
                id: key,
                bucketName: bucket,
                fileSize: size,
                uploadTime: new Date().toISOString(),
            }
        }))

        console.log(`Successfully saved ${key} metdadata to DynamoDB`);
    }
}