import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// Initialize S3 Client with AWS SDK v3
const s3Client = new S3Client({
  region: process.env.MJ_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MJ_AWS_ACCESS_KEY,
    secretAccessKey: process.env.MJ_AWS_SECRET_KEY,
  },
});

export default s3Client;
