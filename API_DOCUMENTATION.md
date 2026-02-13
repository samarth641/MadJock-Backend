# MadJock Backend API Documentation

Complete API reference for the MadJock Sales Backend application.

**Base URL**: `http://localhost:5000`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Business Management](#business-management)
3. [Sales Person Management](#sales-person-management)
4. [Service Management](#service-management)
5. [Featured Advertisements](#featured-advertisements)
6. [Admin Users](#admin-users)
7. [App Users Management](#app-users-management)
8. [Services & Categories](#services--categories)
9. [File Upload Guide](#file-upload-guide)

---

## Authentication

### Send OTP

Send OTP to user's phone number for verification.

**Endpoint**: `POST /api/auth/send-otp`

**Request Body**:
```json
{
  "phoneNumber": "9876543210"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

### Verify OTP

Verify OTP sent to user's phone.

**Endpoint**: `POST /api/auth/verify-otp`

**Request Body**:
```json
{
  "phoneNumber": "9876543210",
  "otp": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

---

### Check Approval Status

Check if user is approved (no OTP required).

**Endpoint**: `POST /api/auth/check-approval`

**Request Body**:
```json
{
  "phoneNumber": "9876543210"
}
```

**Response**:
```json
{
  "success": true,
  "approved": true,
  "user": {
    "name": "John Doe",
    "phoneNumber": "9876543210"
  }
}
```

---

### Register Full User

Register a new user with complete details.

**Endpoint**: `POST /api/auth/register-full`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "9876543210",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### User Login

Login for approved users.

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

---

### Admin Login

Admin login (no approval check).

**Endpoint**: `POST /api/auth/admin/login`

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Admin login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## Business Management

### Add Business (with S3 Upload)

Add a new business with file uploads to S3.

**Endpoint**: `POST /api/admin/business/add-business`

**Content-Type**: `multipart/form-data`

**Form Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| businessName | text | Yes | Business name |
| ownerName | text | Yes | Owner name |
| whatsapp | text | Yes | WhatsApp number |
| description | text | No | Business description |
| address | text | No | Business address |
| city | text | No | City |
| state | text | No | State |
| pincode | text | No | PIN code |
| businessCategory | text | No | Business category |
| products | text | No | Products offered |
| noOfEmployee | text | No | Number of employees |
| establishedIn | text | No | Year established |
| websiteLink | text | No | Website URL |
| facebookLink | text | No | Facebook URL |
| instagramLink | text | No | Instagram URL |
| twitterLink | text | No | Twitter URL |
| facebook | text | No | "YES" or "NO" |
| instagram | text | No | "YES" or "NO" |
| twitter | text | No | "YES" or "NO" |
| website | text | No | "YES" or "NO" |
| images | file | No | Business images (max 10) |
| logo | file | No | Business logo (1 file) |
| banner | file | No | Business banner (1 file) |
| selfie | file | No | Owner selfie (1 file) |
| businessDoc | file | No | Business document (1 file) |
| gstDoc | file | No | GST certificate (1 file) |

**Response**:
```json
{
  "success": true,
  "message": "Business added successfully (Pending approval)",
  "data": {
    "_id": "698ebf1c30f3e739ac507bbe",
    "fileUrls": [
      "https://madjock-apsouth-1.s3.ap-south-1.amazonaws.com/business/images/images-1770962716080-abc.jpg"
    ],
    "selectedApprovedBusiness": {
      "businessName": "Test Business",
      "businessLogo": "https://madjock-apsouth-1.s3.ap-south-1.amazonaws.com/business/logos/logo-1770962716080-xyz.png",
      "businessBanner": "https://madjock-apsouth-1.s3.ap-south-1.amazonaws.com/business/banners/banner-1770962716080-def.jpg",
      "selfieImage": "https://madjock-apsouth-1.s3.ap-south-1.amazonaws.com/business/selfies/selfie-1770962716081-ghi.jpg"
    }
  }
}
```

---

### Get All Businesses

Get all businesses with optional status filter.

**Endpoint**: `GET /api/admin/business/all`

**Query Parameters**:
- `status` (optional): `pending`, `approved`, or `rejected`

**Examples**:
- All businesses: `GET /api/admin/business/all`
- Pending only: `GET /api/admin/business/all?status=pending`
- Approved only: `GET /api/admin/business/all?status=approved`

**Response**:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "698ebf1c30f3e739ac507bbe",
      "status": "pending",
      "selectedApprovedBusiness": {
        "businessName": "Test Business",
        "ownerName": "John Doe",
        "contactNumber": "9876543210"
      }
    }
  ]
}
```

---

### Approve Business

Approve a business by ID.

**Endpoint**: `PUT /api/admin/business/:businessId/approved`

**URL Parameters**:
- `businessId`: MongoDB ObjectId of the business

**Response**:
```json
{
  "success": true,
  "message": "Business approved successfully",
  "data": {
    "_id": "698ebf1c30f3e739ac507bbe",
    "status": "approved"
  }
}
```

---

### Reject Business

Reject a business by ID.

**Endpoint**: `PUT /api/admin/business/:businessId/rejected`

**URL Parameters**:
- `businessId`: MongoDB ObjectId of the business

**Response**:
```json
{
  "success": true,
  "message": "Business rejected successfully",
  "data": {
    "_id": "698ebf1c30f3e739ac507bbe",
    "status": "rejected"
  }
}
```

---

### Assign Business to Sales Person

Assign a business to a sales person.

**Endpoint**: `PUT /api/admin/business/:businessId/assign`

**URL Parameters**:
- `businessId`: MongoDB ObjectId of the business

**Request Body**:
```json
{
  "salesPersonId": "507f1f77bcf86cd799439011",
  "salesPersonUserId": "9876543210"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Business assigned to sales person successfully",
  "data": {
    "_id": "698ebf1c30f3e739ac507bbe",
    "selectedApprovedBusiness": {
      "assignedSalesPersonId": "507f1f77bcf86cd799439011",
      "assignedSalesPersonUserId": "9876543210"
    }
  }
}
```

---

### Get Businesses for Sales Person

Get all businesses assigned to a sales person.

**Endpoint**: `GET /api/admin/business/sales/:salesPersonId/businesses`

**URL Parameters**:
- `salesPersonId`: User ID of the sales person (phone number)

**Response**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "698ebf1c30f3e739ac507bbe",
      "status": "approved",
      "selectedApprovedBusiness": {
        "businessName": "Test Business",
        "assignedSalesPersonUserId": "9876543210"
      }
    }
  ]
}
```

---

### Delete Business

Delete a business by ID.

**Endpoint**: `DELETE /api/admin/business/:businessId`

**URL Parameters**:
- `businessId`: MongoDB ObjectId of the business

**Response**:
```json
{
  "success": true,
  "message": "Business deleted successfully"
}
```

---

## Sales Person Management

### Get Pending Sales Persons

Get all pending sales persons.

**Endpoint**: `GET /api/admin/users/pending`

**Response**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Sales Person",
      "phoneNumber": "9876543210",
      "approved": false
    }
  ]
}
```

---

### Get Approved Sales Persons

Get all approved sales persons.

**Endpoint**: `GET /api/admin/users/approved`

**Response**:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Sales Person",
      "phoneNumber": "9876543210",
      "approved": true
    }
  ]
}
```

---

### Approve Sales Person

Approve a sales person by ID.

**Endpoint**: `PUT /api/admin/users/:id/approve`

**URL Parameters**:
- `id`: MongoDB ObjectId of the sales person

**Response**:
```json
{
  "success": true,
  "message": "Sales person approved successfully"
}
```

---

### Reject Sales Person

Reject a sales person by ID.

**Endpoint**: `PUT /api/admin/users/:id/reject`

**URL Parameters**:
- `id`: MongoDB ObjectId of the sales person

**Response**:
```json
{
  "success": true,
  "message": "Sales person rejected successfully"
}
```

---

## Service Management

### Get All Service Inquiries

Get all service inquiries.

**Endpoint**: `GET /api/admin/service/service-inquiry`

**Response**:
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "serviceName": "Web Development",
      "status": "pending"
    }
  ]
}
```

---

### Approve Service Inquiry

Approve a service inquiry.

**Endpoint**: `PUT /api/admin/service/service-inquiry/:id/approve`

**URL Parameters**:
- `id`: MongoDB ObjectId of the service inquiry

**Response**:
```json
{
  "success": true,
  "message": "Service inquiry approved successfully"
}
```

---

### Reject Service Inquiry

Reject a service inquiry.

**Endpoint**: `PUT /api/admin/service/service-inquiry/:id/reject`

**URL Parameters**:
- `id`: MongoDB ObjectId of the service inquiry

**Response**:
```json
{
  "success": true,
  "message": "Service inquiry rejected successfully"
}
```

---

## Featured Advertisements

### Get All Featured Ads

Get all featured advertisements (approved businesses).

**Endpoint**: `GET /api/admin/featured/all`

**Response**:
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "businessId": "698ebf1c30f3e739ac507bbe",
      "status": "approved",
      "selectedApprovedBusiness": {
        "businessName": "Featured Business"
      }
    }
  ]
}
```

---

## Admin Users

### Get All Admins

Get all admin users.

**Endpoint**: `GET /api/app-users/all`

**Response**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Admin User",
      "email": "admin@example.com",
      "approved": true
    }
  ]
}
```

---

### Approve Admin

Approve an admin user.

**Endpoint**: `PUT /api/app-users/approve/:id`

**URL Parameters**:
- `id`: MongoDB ObjectId of the admin

**Response**:
```json
{
  "success": true,
  "message": "Admin approved successfully"
}
```

---

### Disable Admin

Disable an admin user.

**Endpoint**: `PUT /api/app-users/disable/:id`

**URL Parameters**:
- `id`: MongoDB ObjectId of the admin

**Response**:
```json
{
  "success": true,
  "message": "Admin disabled successfully"
}
```

---

### Delete Admin

Delete an admin user.

**Endpoint**: `DELETE /api/app-users/delete/:id`

**URL Parameters**:
- `id`: MongoDB ObjectId of the admin

**Response**:
```json
{
  "success": true,
  "message": "Admin deleted successfully"
}
```

---

## App Users Management

### Get All App Users

Get all app users from usersInfo collection.

**Endpoint**: `GET /api/users/all`

**Response**:
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "App User",
      "phoneNumber": "9876543210",
      "blocked": false
    }
  ]
}
```

---

### Block User

Block an app user.

**Endpoint**: `PUT /api/users/:id/block`

**URL Parameters**:
- `id`: MongoDB ObjectId of the user

**Response**:
```json
{
  "success": true,
  "message": "User blocked successfully"
}
```

---

### Unblock User

Unblock an app user.

**Endpoint**: `PUT /api/users/:id/unblock`

**URL Parameters**:
- `id`: MongoDB ObjectId of the user

**Response**:
```json
{
  "success": true,
  "message": "User unblocked successfully"
}
```

---

### Delete User

Delete an app user.

**Endpoint**: `DELETE /api/users/:id`

**URL Parameters**:
- `id`: MongoDB ObjectId of the user

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Services & Categories

### Get All Services

Get all services.

**Endpoint**: `GET /api/admin/alter/services`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Web Development",
      "description": "Service description"
    }
  ]
}
```

---

### Add Service

Add a new service.

**Endpoint**: `POST /api/admin/alter/services`

**Request Body**:
```json
{
  "name": "New Service",
  "description": "Service description"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Service added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "New Service"
  }
}
```

---

### Get All Categories

Get all categories.

**Endpoint**: `GET /api/admin/alter/categories`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Retail",
      "description": "Category description"
    }
  ]
}
```

---

### Add Category

Add a new category.

**Endpoint**: `POST /api/admin/alter/categories`

**Request Body**:
```json
{
  "name": "New Category",
  "description": "Category description"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Category added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "New Category"
  }
}
```

---

## File Upload Guide

### S3 Upload Configuration

All file uploads are automatically stored in AWS S3. The following file types are supported:

**Image Files**:
- Formats: JPEG, JPG, PNG, GIF, WebP
- Max Size: 10MB per file
- Fields: `images`, `logo`, `banner`, `selfie`

**Document Files**:
- Formats: PDF, DOC, DOCX, JPEG, JPG, PNG
- Max Size: 10MB per file
- Fields: `businessDoc`, `gstDoc`

### S3 Folder Structure

Files are organized in the S3 bucket as follows:

```
madjock-apsouth-1/
├── business/
│   ├── images/          # Business images
│   ├── logos/           # Business logos
│   ├── banners/         # Business banners
│   ├── selfies/         # Owner selfies
│   └── documents/       # Business documents & GST certificates
```

### Example File Upload with cURL

```bash
curl -X POST http://localhost:5000/api/admin/business/add-business \
  -F "businessName=Test Business" \
  -F "ownerName=John Doe" \
  -F "whatsapp=9876543210" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "logo=@/path/to/logo.png" \
  -F "banner=@/path/to/banner.jpg" \
  -F "selfie=@/path/to/selfie.jpg"
```

### Error Responses

**File Size Error**:
```json
{
  "success": false,
  "message": "File size too large. Maximum size is 10MB"
}
```

**File Type Error**:
```json
{
  "success": false,
  "message": "Only image files are allowed (jpeg, jpg, png, gif, webp)"
}
```

**Too Many Files**:
```json
{
  "success": false,
  "message": "Too many files uploaded"
}
```

---

## Environment Variables

Required environment variables:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT
JWT_SECRET=your_jwt_secret_key

# AWS S3
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
S3_BUCKET=your-bucket-name

# SMS (Draft4SMS)
DRAFT4SMS_API_KEY=your_api_key
DRAFT4SMS_SENDER_ID=your_sender_id
DRAFT4SMS_TEMPLATE_ID=your_template_id

# OTP Settings
OTP_EXPIRE_MINUTES=5
```

---

## Importing Postman Collection

1. Open Postman
2. Click **Import** button
3. Select the `MadJock_API_Collection.postman_collection.json` file
4. The collection will be imported with all endpoints
5. Update the `base_url` variable if needed (default: `http://localhost:5000`)

---

## Testing

### Test S3 Configuration

```bash
node utils/testS3Upload.js
```

### Test Add Business with Files

```bash
node utils/testAddBusiness.js
```

### Verify MongoDB Entry

```bash
node utils/verifyMongoDBEntry.js
```

---

## Support

For issues or questions, please refer to:
- [S3 Upload Guide](./S3_UPLOAD_GUIDE.md)
- [Walkthrough Documentation](../brain/walkthrough.md)
