# Media Processor: AI-Powered Image Tagger

### V4: Event-Driven Image Uploads & AI Analysis

Version 4 introduces an asynchronous Fan-out architecture. Instead of one Lambda doing all the work, a "Dispatcher" Lambda notifies an SNS Topic, which then triggers multiple specialized workers (starting with our AI Analyzer). This makes the system more modular, resilient, and ready for parallel tasks.

## Architecture

![Architecture Diagram](images/Media-Processor-V4.jpg)

The application follows a simple serverless architecture:

1.  **API Gateway (HTTP API)**: A high-performance endpoint for requesting **S3 Presigned URLs**.
2.  **S3 Bucket**: Receives the binary image data from the client.
3.  **Dispatcher Lambda**: Triggered by S3 `ObjectCreated`. It writes an initial "PENDING" record to DynamoDB and publishes a message to the **SNS Topic**.
4.  **Amazon SNS (Image Events Topic)**: Acts as the message hub, broadcasting the image location to all "listeners."
5.  **AI Analyzer Lambda**: An SNS subscriber that receives the message, calls **Amazon Rekognition** for labels, and updates the DynamoDB record.
6.  **Amazon DynamoDB**: The source of truth for metadata, storing everything from file size to AI-generated tags.

## Project Structure

```
.
├── image-logger/           # Lambda function source code
│   ├── app.ts              # Initial DB log & SNS Broadcast
│   ├── get-url.ts          # Get url for upload to S3 
│   ├── image-analzer.ts    # SNS Subsciber for AI Analysis
│   └── package.json        # Dependencies (AWS SDK v3)
├── events/                 # Mock events for local testing
│   └── s3-event.json       # Generated S3 Put event
├── template.yaml           # SAM template (Infrastructure as Code)
└── env.json                # Local environment variables mapping
```

## Prerequisites

- AWS CLI configured with Administrator permissions.
- SAM CLI installed.
- Docker installed (for local testing).
- Node.js 20.x and esbuild installed globally (`npm install -g esbuild`).

## Upcoming features

- New AWS lambda for resize the image (using jimp)
- AI safety check lambda to check if the image is safe for work (NSFW)

## Getting Started

### 1. Installation

Install dependencies for the Lambda function:

```bash
cd image-logger
npm install
cd ..
```

### 2. Build the Application

The `sam build` command compiles the TypeScript code into a bundled JavaScript file using esbuild as defined in `template.yaml`.

```bash
sam build
```

### 3. Deploy to AWS

For the first deployment, use the guided mode to set your stack name and region:

```bash
sam deploy --guided
```

**Note:** After deployment, copy the Physical ID of the DynamoDB table from the AWS Console for local testing.

## Local Development & Testing

Since this project interacts with AWS services, we use a **Hybrid Local** approach where the code runs on your machine but communicates with the real DynamoDB table in the cloud.

### Step 1: Prepare Environment Variables

Create an `env.json` file in the root directory. Replace `YOUR_ACTUAL_TABLE_NAME` with the name found in your AWS Console.

```json
{
  "ImageProcessorFunction": {
    "TABLE_NAME": "YOUR_ACTUAL_TABLE_NAME"
  }
}
```

### Step 2: Invoke Locally

Run the function using a mock S3 event:

```bash
sam local invoke ImageProcessorFunction -e events/s3-event.json --env-vars env.json
```


## Clean Up

To remove all resources created by this project:

1. Empty the S3 bucket: `aws s3 rm s3://YOUR_BUCKET_NAME --recursive`
2. Delete the stack: `sam delete`
