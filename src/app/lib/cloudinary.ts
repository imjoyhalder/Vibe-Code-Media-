import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileBuffer: Buffer, folder: string = 'vibecode'): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uniqueName = `${uuidv4()}`;

    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: uniqueName,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result.secure_url) {
          resolve({ url: result.secure_url, publicId: result.public_id });
        } else {
          reject(new Error('Upload failed'));
        }
      }
    ).end(fileBuffer);
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};