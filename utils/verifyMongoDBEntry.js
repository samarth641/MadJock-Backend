// Verify the latest business entry in MongoDB
import mongoose from "mongoose";
import dotenv from "dotenv";
import AddBusiness from "../models/AddBusiness.js";

dotenv.config();

async function verifyLatestBusiness() {
    try {
        console.log("🔍 Connecting to MongoDB...\n");

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB\n");

        // Get the latest business
        const latestBusiness = await AddBusiness.findOne()
            .sort({ createdAt: -1 })
            .limit(1);

        if (!latestBusiness) {
            console.log("❌ No businesses found in database");
            process.exit(0);
        }

        console.log("📊 Latest Business Entry:");
        console.log("=".repeat(60));
        console.log(`\n🆔 MongoDB ID: ${latestBusiness._id}`);
        console.log(`📅 Created: ${latestBusiness.createdAt}`);
        console.log(`\n📝 Business Details:`);
        console.log(`   Name: ${latestBusiness.selectedApprovedBusiness.businessName}`);
        console.log(`   Owner: ${latestBusiness.selectedApprovedBusiness.ownerName}`);
        console.log(`   Contact: ${latestBusiness.selectedApprovedBusiness.contactNumber}`);
        console.log(`   Status: ${latestBusiness.status}`);

        console.log(`\n🖼️  File URLs (S3):`);
        console.log("=".repeat(60));

        console.log(`\n📸 Business Images (${latestBusiness.fileUrls.length}):`);
        latestBusiness.fileUrls.forEach((url, index) => {
            const isS3 = url.includes('s3.amazonaws.com') || url.includes('s3.');
            const status = isS3 ? '✅ S3' : '❌ NOT S3';
            console.log(`   ${index + 1}. ${status}: ${url.substring(0, 80)}...`);
        });

        console.log(`\n🎨 Logo:`);
        const logoUrl = latestBusiness.selectedApprovedBusiness.businessLogo;
        const isLogoS3 = logoUrl.includes('s3.amazonaws.com') || logoUrl.includes('s3.');
        console.log(`   ${isLogoS3 ? '✅ S3' : '❌ NOT S3'}: ${logoUrl}`);

        console.log(`\n🎪 Banner:`);
        const bannerUrl = latestBusiness.selectedApprovedBusiness.businessBanner;
        const isBannerS3 = bannerUrl.includes('s3.amazonaws.com') || bannerUrl.includes('s3.');
        console.log(`   ${isBannerS3 ? '✅ S3' : '❌ NOT S3'}: ${bannerUrl}`);

        console.log(`\n📷 Selfie:`);
        const selfieUrl = latestBusiness.selectedApprovedBusiness.selfieImage;
        const isSelfieS3 = selfieUrl.includes('s3.amazonaws.com') || selfieUrl.includes('s3.');
        console.log(`   ${isSelfieS3 ? '✅ S3' : '❌ NOT S3'}: ${selfieUrl}`);

        // Check for document URLs if they exist
        if (latestBusiness.selectedApprovedBusiness.businessDocumentUrl) {
            console.log(`\n📄 Business Document:`);
            const docUrl = latestBusiness.selectedApprovedBusiness.businessDocumentUrl;
            const isDocS3 = docUrl.includes('s3.amazonaws.com') || docUrl.includes('s3.');
            console.log(`   ${isDocS3 ? '✅ S3' : '❌ NOT S3'}: ${docUrl}`);
        }

        if (latestBusiness.selectedApprovedBusiness.gstCertificateUrl) {
            console.log(`\n📋 GST Certificate:`);
            const gstUrl = latestBusiness.selectedApprovedBusiness.gstCertificateUrl;
            const isGstS3 = gstUrl.includes('s3.amazonaws.com') || gstUrl.includes('s3.');
            console.log(`   ${isGstS3 ? '✅ S3' : '❌ NOT S3'}: ${gstUrl}`);
        }

        console.log("\n" + "=".repeat(60));

        // Summary
        const allUrls = [
            ...latestBusiness.fileUrls,
            logoUrl,
            bannerUrl,
            selfieUrl,
        ].filter(url => url);

        const s3Urls = allUrls.filter(url =>
            url.includes('s3.amazonaws.com') || url.includes('s3.')
        );

        console.log(`\n📊 Summary:`);
        console.log(`   Total URLs: ${allUrls.length}`);
        console.log(`   S3 URLs: ${s3Urls.length}`);
        console.log(`   Success Rate: ${((s3Urls.length / allUrls.length) * 100).toFixed(1)}%`);

        if (s3Urls.length === allUrls.length) {
            console.log(`\n✨ SUCCESS! All files are stored in S3!`);
        } else {
            console.log(`\n⚠️  WARNING: Some files are not using S3 URLs`);
        }

        await mongoose.connection.close();
        console.log(`\n✅ Database connection closed`);

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    }
}

verifyLatestBusiness();
