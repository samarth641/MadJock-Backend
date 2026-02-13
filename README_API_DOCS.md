# 📚 MadJock Backend API Documentation

Complete API documentation for the MadJock Sales Backend application with AWS S3 file upload support.

## 📦 Documentation Files

This directory contains comprehensive API documentation:

| File | Description |
|------|-------------|
| **[MadJock_API_Collection.postman_collection.json](./MadJock_API_Collection.postman_collection.json)** | Postman collection with all API endpoints (import into Postman) |
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | Complete API reference with detailed examples |
| **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** | Quick reference guide for common endpoints |
| **[S3_UPLOAD_GUIDE.md](./S3_UPLOAD_GUIDE.md)** | Guide for S3 file upload functionality |

## 🚀 Quick Start

### 1. Import Postman Collection

1. Open Postman
2. Click **Import** button
3. Select `MadJock_API_Collection.postman_collection.json`
4. Update `base_url` variable if needed (default: `http://localhost:5000`)

### 2. Start the Server

```bash
node server.js
```

### 3. Test S3 Upload

```bash
node utils/testS3Upload.js
```

## 📊 API Overview

### Total Endpoints: 34+

| Category | Count | Description |
|----------|-------|-------------|
| **Authentication** | 6 | OTP, Login, Register |
| **Business Management** | 8 | Add, Approve, Assign, Delete (with S3 upload) |
| **Sales Person Management** | 4 | Pending, Approved, Assign |
| **Service Management** | 3 | Inquiries, Approve, Reject |
| **Featured Advertisements** | 1 | Get featured businesses |
| **Admin Users** | 4 | Approve, Disable, Delete |
| **App Users** | 4 | Block, Unblock, Delete |
| **Services & Categories** | 4 | Get, Add services and categories |

## 🔑 Key Features

### ✅ AWS S3 File Upload
- Automatic upload to S3 bucket
- Support for images and documents
- File validation (type and size)
- Organized folder structure
- URLs stored in MongoDB

### ✅ Authentication
- OTP-based verification
- User and Admin login
- Approval workflow

### ✅ Business Management
- Add business with file uploads
- Approve/Reject workflow
- Assign to sales persons
- Status filtering

## 📁 File Upload Support

### Supported File Types

**Images** (max 10MB):
- JPEG, JPG, PNG, GIF, WebP
- Fields: `images`, `logo`, `banner`, `selfie`

**Documents** (max 10MB):
- PDF, DOC, DOCX, JPEG, JPG, PNG
- Fields: `businessDoc`, `gstDoc`

### S3 Folder Structure

```
madjock-apsouth-1/
├── business/
│   ├── images/          # Business images
│   ├── logos/           # Business logos
│   ├── banners/         # Business banners
│   ├── selfies/         # Owner selfies
│   └── documents/       # Business & GST documents
```

## 🧪 Testing Utilities

```bash
# Test S3 configuration
node utils/testS3Upload.js

# Test add business with files
node utils/testAddBusiness.js

# Verify MongoDB entry
node utils/verifyMongoDBEntry.js
```

## 🌐 Base URL

```
http://localhost:5000
```

## 📖 Common Endpoints

### Add Business (with S3 Upload)

```bash
POST /api/admin/business/add-business
Content-Type: multipart/form-data

Required Fields:
- businessName
- ownerName
- whatsapp

Optional Files:
- images (max 10)
- logo
- banner
- selfie
- businessDoc
- gstDoc
```

### Get All Businesses

```bash
GET /api/admin/business/all
GET /api/admin/business/all?status=pending
GET /api/admin/business/all?status=approved
```

### Approve Business

```bash
PUT /api/admin/business/:businessId/approved
```

### User Login

```bash
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password123" }
```

## 🔧 Environment Variables

Required in `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://...

# AWS S3
MJ_AWS_ACCESS_KEY=your_access_key
MJ_AWS_SECRET_KEY=your_secret_key
MJ_AWS_REGION=ap-south-1
S3_BUCKET=madjock-apsouth-1

# JWT
JWT_SECRET=your_jwt_secret

# SMS (Draft4SMS)
DRAFT4SMS_API_KEY=your_api_key
DRAFT4SMS_SENDER_ID=your_sender_id
DRAFT4SMS_TEMPLATE_ID=your_template_id

# OTP
OTP_EXPIRE_MINUTES=5
```

## 📚 Documentation Structure

```
backend/
├── MadJock_API_Collection.postman_collection.json  # Postman collection
├── API_DOCUMENTATION.md                            # Full API docs
├── API_QUICK_REFERENCE.md                          # Quick reference
├── S3_UPLOAD_GUIDE.md                              # S3 upload guide
├── README_API_DOCS.md                              # This file
├── config/
│   └── s3.config.js                                # S3 configuration
├── middleware/
│   └── upload.middleware.js                        # Upload middleware
└── utils/
    ├── testS3Upload.js                             # S3 test utility
    ├── testAddBusiness.js                          # Business test utility
    └── verifyMongoDBEntry.js                       # MongoDB verification
```

## 🎯 Example Usage

### Using cURL

```bash
curl -X POST http://localhost:5000/api/admin/business/add-business \
  -F "businessName=My Business" \
  -F "ownerName=John Doe" \
  -F "whatsapp=9876543210" \
  -F "city=Mumbai" \
  -F "state=Maharashtra" \
  -F "images=@image1.jpg" \
  -F "logo=@logo.png"
```

### Using Postman

1. Select **POST** method
2. Enter URL: `http://localhost:5000/api/admin/business/add-business`
3. Go to **Body** tab
4. Select **form-data**
5. Add text fields (businessName, ownerName, whatsapp)
6. Add file fields (change type to "File")
7. Click **Send**

## ✅ Verification

After adding a business, verify:

1. **MongoDB**: Check if document is created with S3 URLs
2. **AWS S3**: Check if files are uploaded to bucket
3. **File Access**: Test S3 URLs in browser

## 🆘 Troubleshooting

### S3 Upload Fails

- Check AWS credentials in `.env`
- Verify S3 bucket name and region
- Check IAM permissions

### File Size Error

- Maximum file size is 10MB
- Reduce file size or compress images

### Invalid File Type

- Only supported formats are allowed
- Check file extension and MIME type

## 📞 Support

For detailed information, refer to:
- [Full API Documentation](./API_DOCUMENTATION.md)
- [S3 Upload Guide](./S3_UPLOAD_GUIDE.md)
- [Quick Reference](./API_QUICK_REFERENCE.md)

---

**Last Updated**: February 13, 2026  
**Version**: 1.0.0  
**Total Endpoints**: 34+
