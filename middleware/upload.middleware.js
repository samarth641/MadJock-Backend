import multer from "multer";
import multerS3 from "multer-s3";
import s3Client from "../config/s3.config.js";
import path from "path";

// Allowed file types
const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
const allowedDocTypes = /pdf|doc|docx|jpeg|jpg|png/;
const allowedVideoTypes = /mp4|mov|avi|wmv|flv|mkv|webm/;

// File filter for images
const imageFileFilter = (req, file, cb) => {
    const extname = allowedImageTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedImageTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
    }
};

// File filter for documents
const docFileFilter = (req, file, cb) => {
    const extname = allowedDocTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedDocTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(
            new Error(
                "Only document files are allowed (pdf, doc, docx, jpeg, jpg, png)"
            )
        );
    }
};

// File filter for community media (images + videos)
const communityFileFilter = (req, file, cb) => {
    const isImage = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) && allowedImageTypes.test(file.mimetype);
    const isVideo = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase()) || file.mimetype.startsWith('video/');

    if (isImage || isVideo) {
        return cb(null, true);
    } else {
        cb(new Error("Only image and video files are allowed"));
    }
};

// S3 storage configuration for business media
const s3Storage = multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const ext = path.extname(file.originalname);
        const filename = `${file.fieldname}-${timestamp}-${randomString}${ext}`;

        // Organize files in folders based on type
        let folder = "business";
        if (file.fieldname.includes("logo")) {
            folder = "business/logos";
        } else if (file.fieldname.includes("banner")) {
            folder = "business/banners";
        } else if (file.fieldname.includes("selfie")) {
            folder = "business/selfies";
        } else if (file.fieldname.includes("images")) {
            folder = "business/images";
        } else if (file.fieldname.includes("doc")) {
            folder = "business/documents";
        } else if (file.fieldname === "sliderImage") {
            folder = "sliders";
        } else if (file.fieldname === "categoryIcon") {
            folder = "category-icons";
        } else if (file.fieldname === "communityMedia") {
            folder = "community";
        }

        cb(null, `${folder}/${filename}`);
    },
});

// Multer upload configuration for category icons
export const uploadCategoryIcon = multer({
    storage: s3Storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for icons
    },
}).single("categoryIcon");

// Multer upload configuration for sliders
export const uploadSliderImage = multer({
    storage: s3Storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
}).single("sliderImage");

// Multer upload configuration for community media
export const uploadCommunityMedia = multer({
    storage: s3Storage,
    fileFilter: communityFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for community posts (allows better video quality)
    },
}).single("communityMedia");

// Multer upload configuration for business media (images, logo, banner, selfie)
export const uploadBusinessMedia = multer({
    storage: s3Storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
    },
}).fields([
    { name: "images", maxCount: 10 }, // Multiple business images
    { name: "logo", maxCount: 1 }, // Business logo
    { name: "banner", maxCount: 1 }, // Business banner
    { name: "selfie", maxCount: 1 }, // Owner selfie
]);

// Multer upload configuration for documents
export const uploadBusinessDocs = multer({
    storage: s3Storage,
    fileFilter: docFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
    },
}).fields([
    { name: "businessDoc", maxCount: 1 }, // Business document
    { name: "gstDoc", maxCount: 1 }, // GST certificate
]);

// Combined upload for all business files
export const uploadAllBusinessFiles = multer({
    storage: s3Storage,
    fileFilter: (req, file, cb) => {
        // Use image filter for media files, doc filter for documents
        if (
            file.fieldname === "businessDoc" ||
            file.fieldname === "gstDoc"
        ) {
            docFileFilter(req, file, cb);
        } else {
            imageFileFilter(req, file, cb);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
    },
}).fields([
    { name: "images", maxCount: 10 },
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
    { name: "businessDoc", maxCount: 1 },
    { name: "gstDoc", maxCount: 1 },
]);

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size too large. Maximum size is 10MB",
            });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files uploaded",
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next();
};
