# MadJock API Quick Reference

Quick reference guide for the most commonly used endpoints.

## 🔑 Authentication

```bash
# Send OTP
POST /api/auth/send-otp
Body: { "phoneNumber": "9876543210" }

# Verify OTP
POST /api/auth/verify-otp
Body: { "phoneNumber": "9876543210", "otp": "123456" }

# User Login
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password123" }

# Admin Login
POST /api/auth/admin/login
Body: { "email": "admin@example.com", "password": "admin123" }
```

## 🏢 Business Management

```bash
# Add Business (with S3 file upload)
POST /api/admin/business/add-business
Content-Type: multipart/form-data
Fields: businessName, ownerName, whatsapp, images, logo, banner, selfie

# Get All Businesses
GET /api/admin/business/all
GET /api/admin/business/all?status=pending
GET /api/admin/business/all?status=approved

# Approve Business
PUT /api/admin/business/:businessId/approved

# Reject Business
PUT /api/admin/business/:businessId/rejected

# Delete Business
DELETE /api/admin/business/:businessId

# Assign to Sales Person
PUT /api/admin/business/:businessId/assign
Body: { "salesPersonId": "...", "salesPersonUserId": "9876543210" }

# Get Businesses for Sales Person
GET /api/admin/business/sales/:salesPersonId/businesses
```

## 👥 Sales Person Management

```bash
# Get Pending Sales Persons
GET /api/admin/users/pending

# Get Approved Sales Persons
GET /api/admin/users/approved

# Approve Sales Person
PUT /api/admin/users/:id/approve

# Reject Sales Person
PUT /api/admin/users/:id/reject
```

## 🛠️ Service Management

```bash
# Get All Service Inquiries
GET /api/admin/service/service-inquiry

# Approve Service Inquiry
PUT /api/admin/service/service-inquiry/:id/approve

# Reject Service Inquiry
PUT /api/admin/service/service-inquiry/:id/reject
```

## ⭐ Featured Advertisements

```bash
# Get All Featured Ads
GET /api/admin/featured/all
```

## 👨‍💼 Admin Users

```bash
# Get All Admins
GET /api/app-users/all

# Approve Admin
PUT /api/app-users/approve/:id

# Disable Admin
PUT /api/app-users/disable/:id

# Delete Admin
DELETE /api/app-users/delete/:id
```

## 📱 App Users

```bash
# Get All App Users
GET /api/users/all

# Block User
PUT /api/users/:id/block

# Unblock User
PUT /api/users/:id/unblock

# Delete User
DELETE /api/users/:id
```

## 🏷️ Services & Categories

```bash
# Get All Services
GET /api/admin/alter/services

# Add Service
POST /api/admin/alter/services
Body: { "name": "Service Name", "description": "..." }

# Get All Categories
GET /api/admin/alter/categories

# Add Category
POST /api/admin/alter/categories
Body: { "name": "Category Name", "description": "..." }
```

## 📁 File Upload (S3)

### Supported File Types

**Images**: JPEG, JPG, PNG, GIF, WebP (max 10MB)
**Documents**: PDF, DOC, DOCX, JPEG, JPG, PNG (max 10MB)

### File Fields

- `images` - Business images (max 10 files)
- `logo` - Business logo (1 file)
- `banner` - Business banner (1 file)
- `selfie` - Owner selfie (1 file)
- `businessDoc` - Business document (1 file)
- `gstDoc` - GST certificate (1 file)

### Example with cURL

```bash
curl -X POST http://localhost:5000/api/admin/business/add-business \
  -F "businessName=My Business" \
  -F "ownerName=John Doe" \
  -F "whatsapp=9876543210" \
  -F "city=Mumbai" \
  -F "state=Maharashtra" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "logo=@logo.png" \
  -F "banner=@banner.jpg" \
  -F "selfie=@selfie.jpg"
```

### S3 URL Format

Files are stored at:
```
https://madjock-apsouth-1.s3.ap-south-1.amazonaws.com/business/{type}/{filename}
```

## 🧪 Testing

```bash
# Test S3 Configuration
node utils/testS3Upload.js

# Test Add Business
node utils/testAddBusiness.js

# Verify MongoDB Entry
node utils/verifyMongoDBEntry.js
```

## 📚 Full Documentation

- **Postman Collection**: `MadJock_API_Collection.postman_collection.json`
- **Full API Docs**: `API_DOCUMENTATION.md`
- **S3 Upload Guide**: `S3_UPLOAD_GUIDE.md`

## 🌐 Base URL

```
http://localhost:5000
```

## 📊 API Summary

| Category | Endpoints |
|----------|-----------|
| Authentication | 6 |
| Business Management | 8 |
| Sales Person Management | 4 |
| Service Management | 3 |
| Featured Advertisements | 1 |
| Admin Users | 4 |
| App Users | 4 |
| Services & Categories | 4 |
| **Total** | **34** |
