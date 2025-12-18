import { S3Event } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB Client
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const tableName = process.env.TABLE_NAME;

export const lambdaHandler = async (event: S3Event): Promise<void> => {
    // This log helps you see the raw data coming from S3
    console.log("EVENT RECEIVED:", JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        try {
            const bucketName = record.s3.bucket.name;
            const fileKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
            const fileSize = record.s3.object.size;
            const eventTime = record.eventTime;

            console.log(`NEW FILE DETECTED: [${fileKey}] in bucket [${bucketName}]`);

            // Save metadata to DynamoDB
            const putParams = {
                TableName: tableName,
                Item: {
                    id: fileKey, // The file path is our unique ID
                    bucket: bucketName,
                    size: fileSize,
                    timestamp: eventTime,
                    status: "PROCESSED_BY_LAMBDA"
                }
            };

            await ddbDocClient.send(new PutCommand(putParams));
            
            console.log(`SUCCESS: Metadata for ${fileKey} saved to table ${tableName}`);

        } catch (error) {
            console.error("ERROR PROCESSING RECORD:", error);
            // Re-throw if you want S3 to retry, or handle silently
        }
    }
};