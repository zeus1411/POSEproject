/**
 * Slugify Utility
 * Converts a string into a URL-friendly slug.
 * Supports Vietnamese characters and special character removal.
 */

const slugify = (str) => {
    if (!str) return '';
    
    return str
        .toLowerCase()
        .normalize('NFD') // Decompose combined characters into base characters + diacritics
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except space and hyphen
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
};

/**
 * Generate a unique slug by checking against a Mongoose model
 * @param {string} text - The source text to slugify
 * @param {Object} model - The Mongoose model to check for uniqueness
 * @returns {Promise<string>} A unique slug
 */
export const generateUniqueSlug = async (text, model) => {
    let slug = slugify(text);
    let slugExists = await model.findOne({ slug });
    let counter = 1;
    
    while (slugExists) {
        slug = `${slugify(text)}-${counter}`;
        slugExists = await model.findOne({ slug });
        counter++;
    }
    
    return slug;
};

export default slugify;
