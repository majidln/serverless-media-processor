# S3 to DynamoDB Logger

A simple serverless application that automatically logs file uploads to DynamoDB whenever a file is added to an S3 bucket.

## What It Does

When you upload a file to the S3 bucket, a Lambda function is automatically triggered that records the following metadata in DynamoDB:
- File name (as the unique ID)
- Bucket name
- File size
- Upload timestamp
- Processing status

## Project Structure

- `image-logger/` - Lambda function code written in TypeScript
- `events/` - Sample S3 events for local testing
- `image-logger/tests/` - Unit tests for the Lambda function
- `template.yaml` - SAM template defining AWS resources (S3, Lambda, DynamoDB)

## Architecture

This application uses three AWS resources:
1. **S3 Bucket** - Stores uploaded files and triggers the Lambda function
2. **Lambda Function** - Processes S3 events and logs metadata to DynamoDB
3. **DynamoDB Table** - Stores file metadata with `id` (file key) as the primary key

If you prefer to use an integrated development environment (IDE) to build and test your application, you can use the AWS Toolkit.  
The AWS Toolkit is an open source plug-in for popular IDEs that uses the SAM CLI to build and deploy serverless applications on AWS. The AWS Toolkit also adds a simplified step-through debugging experience for Lambda function code. See the following links to get started.

* [CLion](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [GoLand](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [IntelliJ](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [WebStorm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [Rider](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [PhpStorm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [PyCharm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [RubyMine](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [DataGrip](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)
* [Visual Studio](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/welcome.html)

## Deploy the sample application

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools:

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js 20+ - [Install Node.js](https://nodejs.org/en/), including the NPM package management tool
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

To build and deploy your application for the first time, run the following in your shell:

```bash
sam build
sam deploy --guided
```

The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts:

* **Stack Name**: The name of the stack to deploy to CloudFormation. This should be unique to your account and region (e.g., `s3-logger`)
* **AWS Region**: The AWS region you want to deploy your app to
* **Confirm changes before deploy**: If set to yes, any change sets will be shown to you before execution for manual review
* **Allow SAM CLI IAM role creation**: Must be yes - the Lambda function needs IAM permissions to read from S3 and write to DynamoDB
* **Save arguments to samconfig.toml**: If set to yes, your choices will be saved for future deployments

After deployment, the output will show:
- **BucketName** - The S3 bucket where you can upload files
- **TableName** - The DynamoDB table where metadata is stored

## Use the SAM CLI to build and test locally

Build your application with the `sam build` command.

```bash
media-processor$ sam build
```

The SAM CLI installs dependencies defined in `image-logger/package.json`, compiles TypeScript with esbuild, creates a deployment package, and saves it in the `.aws-sam/build` folder.

Test the function locally by invoking it with a sample S3 event:

```bash
media-processor$ sam local invoke ImageProcessorFunction --event events/s3-event.json
```

This simulates an S3 file upload event without actually uploading to S3. Check the console output to see the Lambda function's logs.

## Testing After Deployment

Once deployed, test the application by uploading a file to the S3 bucket:

```bash
# Get the bucket name from the CloudFormation outputs
aws s3 cp myfile.txt s3://YOUR-BUCKET-NAME/

# Check DynamoDB to see the logged metadata
aws dynamodb scan --table-name YOUR-TABLE-NAME
```

## Add a resource to your application
The application template uses AWS Serverless Application Model (AWS SAM) to define application resources. AWS SAM is an extension of AWS CloudFormation with a simpler syntax for configuring common serverless application resources such as functions, triggers, and APIs. For resources not included in [the SAM specification](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md), you can use standard [AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html) resource types.

## View Lambda Logs

To see what's happening when files are uploaded, tail the Lambda function logs:

```bash
media-processor$ sam logs -n ImageProcessorFunction --stack-name YOUR-STACK-NAME --tail
```

This will show you real-time logs including:
- S3 event details
- File metadata being processed
- DynamoDB write confirmations
- Any errors that occur

You can find more information about filtering Lambda function logs in the [SAM CLI Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html).

## Unit Tests

Tests are defined in the `image-logger/tests` folder. Use NPM to install the [Jest test framework](https://jestjs.io/) and run unit tests:

```bash
media-processor$ cd image-logger
image-logger$ npm install
image-logger$ npm run test
```

## Cleanup

To delete the application and all its resources (S3 bucket, Lambda function, DynamoDB table):

```bash
sam delete --stack-name YOUR-STACK-NAME
```

**Note**: You may need to empty the S3 bucket before deletion if it contains files.

## Resources

See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to SAM specification, the SAM CLI, and serverless application concepts.

Next, you can use AWS Serverless Application Repository to deploy ready to use Apps that go beyond hello world samples and learn how authors developed their applications: [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/)
