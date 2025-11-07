import { v2 as cloudinary } from 'cloudinary';
import { promisify } from 'util';

const uploadImage = promisify(cloudinary.uploader.upload);
const destroyImage = promisify(cloudinary.uploader.destroy);

/**
 * Upload an image to Cloudinary
 * @param {Buffer|string} file - Image buffer or file path
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
export const uploadToCloudinary = async (file, folder = 'pose/products') => {
  try {
    const result = await uploadImage(file, {
      folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete one or more images from Cloudinary
 * @param {string|string[]} publicIds - Single public ID or array of public IDs
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicIds) => {
  try {
    if (Array.isArray(publicIds)) {
      return await cloudinary.api.delete_resources(publicIds);
    }
    return await destroyImage(publicIds);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image(s) from Cloudinary');
  }
};

/**
 * Delete a folder and all its contents from Cloudinary
 * @param {string} folderPath - Path to the folder to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFolderFromCloudinary = async (folderPath) => {
  try {
    // Get all resources in the folder
    const { resources } = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPath,
      max_results: 500
    });

    // Delete all resources
    if (resources && resources.length > 0) {
      const publicIds = resources.map(file => file.public_id);
      await cloudinary.api.delete_resources(publicIds);
    }

    // Delete the folder itself
    return await cloudinary.api.delete_folder(folderPath);
  } catch (error) {
    if (error.http_code === 404) {
      return { result: 'not_found' };
    }
    console.error('Error deleting folder from Cloudinary:', error);
    throw new Error('Failed to delete folder from Cloudinary');
  }
};
