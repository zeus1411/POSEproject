import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

dotenv.config({ path: envPath });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadImage = promisify(cloudinary.uploader.upload);

/**
 * Upload a single image to Cloudinary
 * @param {string} imagePath - Path to the image file
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<Object>} Upload result
 */
async function uploadImageToCloudinary(imagePath, folder = 'pose/products') {
  try {
    const result = await uploadImage(imagePath, {
      folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    console.error(`Error uploading ${imagePath}:`, error.message);
    return {
      success: false,
      error: error.message,
      path: imagePath
    };
  }
}

/**
 * Upload all images from a directory to Cloudinary
 * @param {string} directory - Directory containing images
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<Array>} Array of upload results
 */
async function uploadImagesFromDirectory(directory, folder = 'pose/products') {
  try {
    const files = fs.readdirSync(directory);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} image files to upload...`);

    const results = [];
    for (const file of imageFiles) {
      const filePath = path.join(directory, file);
      console.log(`Uploading ${file}...`);
      
      const result = await uploadImageToCloudinary(filePath, folder);
      results.push(result);
      
      // Add a small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  } catch (error) {
    console.error('Error reading directory:', error);
    throw error;
  }
}

// Main execution
(async () => {
  try {
    const imageDirectory = path.join(__dirname, '../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(imageDirectory)) {
      fs.mkdirSync(imageDirectory, { recursive: true });
      console.log(`Directory created at: ${imageDirectory}`);
      console.log('Please place your image files in this directory and run the script again.');
      process.exit(0);
    }

    console.log('Starting image uploads to Cloudinary...');
    const results = await uploadImagesFromDirectory(imageDirectory);
    
    // Process results
    const successfulUploads = results.filter(r => r.success);
    const failedUploads = results.filter(r => !r.success);
    
    console.log(`\nUpload complete!`);
    console.log(`✅ Successfully uploaded: ${successfulUploads.length} images`);
    console.log(`❌ Failed to upload: ${failedUploads.length} images`);
    
    if (failedUploads.length > 0) {
      console.log('\nFailed uploads:');
      failedUploads.forEach((upload, index) => {
        console.log(`${index + 1}. ${upload.path}: ${upload.error}`);
      });
    }
    
    // Save results to JSON file
    const resultData = {
      timestamp: new Date().toISOString(),
      total: results.length,
      successful: successfulUploads.length,
      failed: failedUploads.length,
      successfulUploads,
      failedUploads
    };
    
    const resultPath = path.join(__dirname, 'upload-results.json');
    fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 2));
    console.log(`\nResults saved to: ${resultPath}`);
    
    // Generate curl command example
    if (successfulUploads.length > 0) {
      const imageUrls = successfulUploads.map(upload => upload.url);
      console.log('\nTo update a product with these images, use the following API:');
      console.log('================================================');
      console.log('POST /api/products/:id/update-images');
      console.log('Content-Type: application/json');
      console.log('Authorization: Bearer YOUR_ACCESS_TOKEN');
      console.log('\nRequest body:');
      console.log(JSON.stringify({ imageUrls }, null, 2));
      console.log('================================================');
    }
    
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
})();
