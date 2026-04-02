import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const uploadImage = async (fileBuffer, folder = 'vibecode') => {
    return new Promise((resolve, reject) => {
        const uniqueName = `${uuidv4()}`;
        cloudinary.uploader.upload_stream({
            folder,
            public_id: uniqueName,
            resource_type: 'image',
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else if (result && result.secure_url) {
                resolve({ url: result.secure_url, publicId: result.public_id });
            }
            else {
                reject(new Error('Upload failed'));
            }
        }).end(fileBuffer);
    });
};
export const deleteImage = async (publicId) => {
    return new Promise((resolve, reject) => {
        if (!publicId || publicId.trim() === '') {
            reject(new Error('Public ID is required for deletion'));
            return;
        }
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                console.error('Cloudinary delete error:', error);
                reject(error);
            }
            else if (result && result.result === 'ok') {
                console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
                resolve();
            }
            else {
                console.warn(`Image deletion result for ${publicId}:`, result);
                // Even if result is not 'ok', resolve as it might already be deleted
                resolve();
            }
        });
    });
};
