// Test script to add a business with file uploads
// This will test the complete flow: file upload to S3 + MongoDB storage

import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create test image files
function createTestImage(filename) {
    const filePath = path.join(__dirname, filename);

    // Create a simple PNG image (1x1 pixel red dot)
    const pngData = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
        0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
        0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00,
        0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    fs.writeFileSync(filePath, pngData);
    return filePath;
}

async function testAddBusiness() {
    try {
        console.log("🧪 Testing Add Business with S3 Upload...\n");

        // Create test image files
        console.log("📁 Creating test image files...");
        const image1Path = createTestImage("test-image1.png");
        const image2Path = createTestImage("test-image2.png");
        const logoPath = createTestImage("test-logo.png");
        const bannerPath = createTestImage("test-banner.png");
        const selfiePath = createTestImage("test-selfie.png");
        console.log("✅ Test files created\n");

        // Create form data
        const form = new FormData();

        // Add text fields
        form.append("businessName", "Test Business " + Date.now());
        form.append("ownerName", "John Doe");
        form.append("whatsapp", "9876543210");
        form.append("description", "This is a test business created via API");
        form.append("address", "123 Test Street, Test Area");
        form.append("city", "Mumbai");
        form.append("state", "Maharashtra");
        form.append("pincode", "400001");
        form.append("businessCategory", "Retail");
        form.append("products", "Test Products");
        form.append("noOfEmployee", "10");
        form.append("establishedIn", "2020");
        form.append("websiteLink", "https://testbusiness.com");
        form.append("facebookLink", "https://facebook.com/testbusiness");
        form.append("instagramLink", "https://instagram.com/testbusiness");
        form.append("facebook", "YES");
        form.append("instagram", "YES");
        form.append("twitter", "NO");
        form.append("website", "YES");

        // Add image files
        form.append("images", fs.createReadStream(image1Path));
        form.append("images", fs.createReadStream(image2Path));
        form.append("logo", fs.createReadStream(logoPath));
        form.append("banner", fs.createReadStream(bannerPath));
        form.append("selfie", fs.createReadStream(selfiePath));

        console.log("📤 Sending POST request to add business...");
        console.log("Endpoint: http://localhost:5000/api/admin/business/add-business\n");

        // Send request
        const response = await axios.post(
            "http://localhost:5000/api/admin/business/add-business",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                },
            }
        );

        console.log("✅ Business added successfully!\n");
        console.log("📊 Response:");
        console.log("Status:", response.data.success);
        console.log("Message:", response.data.message);
        console.log("\n📁 Uploaded File URLs:");

        const business = response.data.data;

        console.log("\n🖼️  Business Images:");
        business.fileUrls.forEach((url, index) => {
            console.log(`  ${index + 1}. ${url}`);
        });

        console.log("\n🎨 Logo:");
        console.log(`  ${business.selectedApprovedBusiness.businessLogo}`);

        console.log("\n🎪 Banner:");
        console.log(`  ${business.selectedApprovedBusiness.businessBanner}`);

        console.log("\n📸 Selfie:");
        console.log(`  ${business.selectedApprovedBusiness.selfieImage}`);

        console.log("\n💾 MongoDB Document ID:");
        console.log(`  ${business._id}`);

        console.log("\n🎯 Business Details:");
        console.log(`  Name: ${business.selectedApprovedBusiness.businessName}`);
        console.log(`  Owner: ${business.selectedApprovedBusiness.ownerName}`);
        console.log(`  Status: ${business.status}`);
        console.log(`  City: ${business.selectedApprovedBusiness.city}`);

        // Clean up test files
        console.log("\n🧹 Cleaning up test files...");
        fs.unlinkSync(image1Path);
        fs.unlinkSync(image2Path);
        fs.unlinkSync(logoPath);
        fs.unlinkSync(bannerPath);
        fs.unlinkSync(selfiePath);
        console.log("✅ Test files cleaned up");

        console.log("\n✨ Test completed successfully!");
        console.log("\n📝 Next Steps:");
        console.log("1. Check MongoDB to verify the document was created");
        console.log("2. Check AWS S3 bucket to see the uploaded files");
        console.log("3. Try accessing the file URLs in a browser");

    } catch (error) {
        console.error("\n❌ Test Failed:");

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Error:", error.response.data);
        } else if (error.request) {
            console.error("No response received from server");
            console.error("Make sure the server is running on http://localhost:5000");
        } else {
            console.error("Error:", error.message);
        }

        // Clean up test files even on error
        try {
            const testFiles = [
                "test-image1.png",
                "test-image2.png",
                "test-logo.png",
                "test-banner.png",
                "test-selfie.png",
            ];

            testFiles.forEach((file) => {
                const filePath = path.join(__dirname, file);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
    }
}

// Run the test
testAddBusiness();
