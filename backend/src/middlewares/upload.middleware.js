'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPEG, PNG, and WEBP images are allowed'));
  }
  cb(null, true);
}

function buildLocalStorage() {
  const uploadDir = path.resolve(env.upload.dir);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${ext}`);
    },
  });
}

function buildCloudinaryStorage() {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });

  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: env.cloudinary.folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      resource_type: 'image',
    },
  });
}


const driver = env.upload.driver === 'cloudinary' ? 'cloudinary' : 'local';
const storage = driver === 'cloudinary' ? buildCloudinaryStorage() : buildLocalStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxFileSize },
});

// Product form: up to 10 images in the "images" field.
const productImages = upload.array('images', 10);

module.exports = { productImages, driver };