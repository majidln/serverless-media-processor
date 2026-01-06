import { S3Event } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";

// Initialize DynamoDB Client
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const rekogClient = new RekognitionClient({});
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

            // 1. AI Analysis
            const detectParams = new DetectLabelsCommand({
                Image: { S3Object: { Bucket: bucketName, Name: fileKey } },
                MaxLabels: 5,
                MinConfidence: 70,
            });

            const rekogResponse = await rekogClient.send(detectParams);
            const labels = rekogResponse.Labels?.map(label => label.Name) || [];

            console.log(`LABELS DETECTED: ${labels}`);

            // Save metadata to DynamoDB
            const putParams = {
                TableName: tableName,
                Item: {
                    id: fileKey, // The file path is our unique ID
                    bucket: bucketName,
                    size: fileSize,
                    timestamp: eventTime,
                    labels: labels,
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