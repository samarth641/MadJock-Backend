# S3 Upload API Documentation

## Overview

All file uploads in the MadJock backend now use AWS S3 for storage. Files are automatically uploaded to the configured S3 bucket and their URLs are stored in the database.

## Supported File Types

### Images
- **Formats**: JPEG, JPG, PNG, GIF, WebP
- **Max Size**: 10MB per file
- **Fields**:
  - `images` - Multiple business images (max 10)
  - `logo` - Business logo (1 file)
  - `banner` - Business banner (1 file)
  - `selfie` - Owner selfie (1 file)

### Documents
- **Formats**: PDF, DOC, DOCX, JPEG, JPG, PNG
- **Max Size**: 10MB per file
- **Fields**:
  - `businessDoc` - Business document (1 file)
  - `gstDoc` - GST certificate (1 file)

## API Endpoint

### Add Business with File Uploads

**Endpoint**: `POST /api/business/add-business`

**Content-Type**: `multipart/form-data`

**Request Fields**:

#### Text Fields
```
businessName: string (required)
ownerName: string (required)
whatsapp: string (required)
description: string
address: string
city: string
state: string
pincode: string
businessCategory: string
products: string
noOfEmployee: string
establishedIn: string
websiteLink: string
facebookLink: string
instagramLink: string
twitterLink: string
facebook: "YES" | "NO"
instagram: "YES" | "NO"
twitter: "YES" | "NO"
website: "YES" | "NO"
businessDoc: "YES" | "NO"
gstDoc: "YES" | "NO"
```

#### File Fields
```
images: File[] (max 10 files)
logo: File (single file)
banner: File (single file)
selfie: File (single file)
businessDoc: File (single file)
gstDoc: File (single file)
```

**Response**:
```json
{
  "success": true,
  "message": "Business added successfully (Pending approval)",
  "data": {
    "_id": "...",
    "fileUrls": [
      "https://madjock-apsouth-1.s3.ap-south-1.amazonaws.com/business/images/images-1234567890-abc123.jpg"
    ],
    "selectedApprovedBusiness": {
      "businessName": "...",
      "businessLogo": "https://madjock-apsouth-1.s3.ap-south-1.amazonaws.com/business/logos/logo-1234567890-xyz789.jpg",
      "businessBanner": "https://madjock-apsouth-1.s3.ap-south-1.amazonaws.com/business/banners/banner-1234567890-def456.jpg",
      "selfieImage": "https://madjock-apsouth-1.s3.ap-south-1.amazonaws.com/business/selfies/selfie-1234567890-ghi789.jpg",
      "businessDocumentUrl": "https://madjock-apsouth-1.s3.ap-south-1.amazonaws.com/business/documents/businessDoc-1234567890-jkl012.pdf",
      "gstCertificateUrl": "https://madjock-apsouth-1.s3.ap-south-1.amazonaws.com/business/documents/gstDoc-1234567890-mno345.pdf",
      ...
    }
  }
}
```

## S3 Folder Structure

Files are organized in the following structure:

```
madjock-apsouth-1/
├── business/
│   ├── images/          # Business images
│   ├── logos/           # Business logos
│   ├── banners/         # Business banners
│   ├── selfies/         # Owner selfies
│   └── documents/       # Business documents & GST certificates
└── test-uploads/        # Test files
```

## Testing with cURL

### Example: Add Business with Files

```bash
curl -X POST http://localhost:5000/api/business/add-business \
  -F "businessName=Test Business" \
  -F "ownerName=John Doe" \
  -F "whatsapp=9876543210" \
  -F "description=A test business" \
  -F "address=123 Main St" \
  -F "city=Mumbai" \
  -F "state=Maharashtra" \
  -F "pincode=400001" \
  -F "businessCategory=Retail" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "logo=@/path/to/logo.png" \
  -F "banner=@/path/to/banner.jpg" \
  -F "selfie=@/path/to/selfie.jpg"
```

## Testing with Postman

1. Create a new POST request to `http://localhost:5000/api/business/add-business`
2. Select **Body** tab
3. Choose **form-data**
4. Add text fields (businessName, ownerName, whatsapp, etc.)
5. Add file fields:
   - Change type from "Text" to "File" for file fields
   - Select files from your computer
6. Send the request

## Error Handling

### File Size Error
```json
{
  "success": false,
  "message": "File size too large. Maximum size is 10MB"
}
```

### File Type Error
```json
{
  "success": false,
  "message": "Only image files are allowed (jpeg, jpg, png, gif, webp)"
}
```

### Too Many Files
```json
{
  "success": false,
  "message": "Too many files uploaded"
}
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_KEY=your_secret_key
AWS_REGION=ap-south-1
S3_BUCKET=madjock-apsouth-1
```

## Testing S3 Configuration

Run the test script to verify S3 is configured correctly:

```bash
node utils/testS3Upload.js
```

Expected output:
```
🧪 Testing S3 Upload Configuration...
✅ Created test file: test-1234567890.txt
📤 Uploading to S3...
✅ Upload successful!
🌐 File URL: https://madjock-apsouth-1.s3.ap-south-1.amazonaws.com/test-uploads/test-1234567890.txt
✨ S3 configuration is working correctly!
```
