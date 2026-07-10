import { v2 as cloudinary } from 'cloudinary';
import config from './index';

let configured = false;

export function configureCloudinary() {
  if (configured) return;
  if (!config.cloudinaryUrl) return;
  cloudinary.config({ cloudinary_url: config.cloudinaryUrl });
  configured = true;
}

export function isCloudinaryConfigured(): boolean {
  return configured && !!config.cloudinaryUrl;
}

export async function uploadToCloudinary(
  filePath: string,
  options: { folder?: string; resource_type?: string } = {}
): Promise<{ url: string; publicId: string }> {
  configureCloudinary();
  const result = await cloudinary.uploader.upload(filePath, {
    folder: options.folder || 'student-biodata',
    resource_type: (options.resource_type as any) || 'auto',
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
