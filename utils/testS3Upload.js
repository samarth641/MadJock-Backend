// Test script to verify S3 upload functionality
// Run this with: node utils/testS3Upload.js

import s3Client from "../config/s3.config.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testS3Upload() {
    try {
        console.log("🧪 Testing S3 Upload Configuration...\n");

        // Create a simple test file
        const testContent = `Test file created at ${new Date().toISOString()}`;
        const testFileName = `test-${Date.now()}.txt`;
        const testFilePath = path.join(__dirname, testFileName);

        // Write test file
        fs.writeFileSync(testFilePath, testContent);
        console.log("✅ Created test file:", testFileName);

        // Read file
        const fileContent = fs.readFileSync(testFilePath);

        // Upload to S3
        const uploadParams = {
            Bucket: process.env.S3_BUCKET,
            Key: `test-uploads/${testFileName}`,
            Body: fileContent,
            ContentType: "text/plain",
        };

        console.log("\n📤 Uploading to S3...");
        console.log("Bucket:", process.env.S3_BUCKET);
        console.log("Region:", process.env.AWS_REGION);
        console.log("Key:", uploadParams.Key);

        const command = new PutObjectCommand(uploadParams);
        const response = await s3Client.send(command);

        console.log("\n✅ Upload successful!");
        console.log("ETag:", response.ETag);
        console.log(
            `\n🌐 File URL: https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`
        );

        // Clean up local test file
        fs.unlinkSync(testFilePath);
        console.log("\n🧹 Cleaned up local test file");

        console.log("\n✨ S3 configuration is working correctly!");
    } catch (error) {
        console.error("\n❌ S3 Upload Test Failed:");
        console.error("Error:", error.message);
        console.error("\nPlease check:");
        console.error("1. AWS credentials in .env file");
        console.error("2. S3 bucket name and region");
        console.error("3. IAM permissions for S3 access");
    }
}

// Run the test
testS3Upload();
