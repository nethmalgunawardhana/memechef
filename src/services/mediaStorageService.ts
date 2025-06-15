// Media storage service for handling file uploads and image management
// Supports Cloudinary, ImageKit, or local storage

export interface MediaConfig {
  provider: 'cloudinary' | 'imagekit' | 'local';
  cloudName?: string;
  apiKey?: string;
  folder?: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface UploadOptions {
  transformation?: Record<string, unknown>;
  folder?: string;
  tags?: string;
}

export interface OptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  crop?: string;
}

export class MediaStorageService {
  private config: MediaConfig;

  constructor(config: MediaConfig = { provider: 'local' }) {
    this.config = config;
  }

  // Upload image to Cloudinary
  async uploadToCloudinary(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const cloudName = this.config.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'memechef_uploads'); // You'd need to create this preset
    formData.append('folder', this.config.folder || 'memechef');
    
    // Add optional parameters
    if (options.transformation) {
      formData.append('transformation', JSON.stringify(options.transformation));
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        size: data.bytes
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }
  // Upload image to ImageKit
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadToImageKit(file: File, _options: UploadOptions = {}): Promise<UploadResult> {
    const apiKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    
    if (!apiKey || !urlEndpoint) {
      throw new Error('ImageKit configuration not found');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('folder', this.config.folder || '/memechef');
    
    // Add tags for organization
    formData.append('tags', 'memechef,ingredient,upload');

    try {
      // Note: This is a simplified version. In production, you'd need to implement
      // authentication signature generation on the server side for security
      const response = await fetch(`${urlEndpoint}/api/v1/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(apiKey + ':')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`ImageKit upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        url: data.url,
        publicId: data.fileId,
        width: data.width,
        height: data.height,
        format: data.fileType,
        size: data.size
      };
    } catch (error) {
      console.error('ImageKit upload error:', error);
      throw error;
    }
  }

  // Store file locally (converts to base64 URL for development)
  async uploadLocally(file: File): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        
        // Create a fake UploadResult for local development
        resolve({
          url: result, // base64 data URL
          publicId: `local_${Date.now()}_${file.name}`,
          width: 0, // Would need additional processing to get dimensions
          height: 0,
          format: file.type.split('/')[1],
          size: file.size
        });
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  // Main upload method that delegates to appropriate provider
  async uploadImage(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size too large (max 10MB)');
    }

    switch (this.config.provider) {
      case 'cloudinary':
        return this.uploadToCloudinary(file, options);
      
      case 'imagekit':
        return this.uploadToImageKit(file, options);
      
      case 'local':
      default:
        return this.uploadLocally(file);
    }
  }
  // Generate optimized image URLs for different use cases
  getOptimizedUrl(publicId: string, options: OptimizationOptions = {}): string {
    switch (this.config.provider) {
      case 'cloudinary':
        return this.getCloudinaryOptimizedUrl(publicId, options);
      
      case 'imagekit':
        return this.getImageKitOptimizedUrl(publicId, options);
      
      default:
        // For local storage, return the original URL
        return publicId;
    }
  }
  // Generate Cloudinary transformation URL
  private getCloudinaryOptimizedUrl(publicId: string, options: OptimizationOptions): string {
    const cloudName = this.config.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const transformations = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    if (options.crop) transformations.push(`c_${options.crop}`);

    const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
  }

  // Generate ImageKit transformation URL
  private getImageKitOptimizedUrl(publicId: string, options: OptimizationOptions): string {
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    const transformations = [];

    if (options.width) transformations.push(`w-${options.width}`);
    if (options.height) transformations.push(`h-${options.height}`);
    if (options.quality) transformations.push(`q-${options.quality}`);
    if (options.format) transformations.push(`f-${options.format}`);

    const transformString = transformations.length > 0 ? `tr:${transformations.join(',')}` : '';
    
    return `${urlEndpoint}/${transformString}/${publicId}`;
  }

  // Delete uploaded image
  async deleteImage(publicId: string): Promise<boolean> {
    switch (this.config.provider) {
      case 'cloudinary':
        return this.deleteFromCloudinary(publicId);
      
      case 'imagekit':
        return this.deleteFromImageKit(publicId);
      
      default:
        // Local storage - nothing to delete
        return true;
    }
  }

  // Delete from Cloudinary
  private async deleteFromCloudinary(publicId: string): Promise<boolean> {
    // Note: This requires server-side implementation for security
    // as it needs the API secret
    console.log(`Would delete ${publicId} from Cloudinary`);
    return true;
  }

  // Delete from ImageKit
  private async deleteFromImageKit(publicId: string): Promise<boolean> {
    // Note: This requires server-side implementation for security
    console.log(`Would delete ${publicId} from ImageKit`);
    return true;
  }

  // Batch upload multiple images
  async uploadMultiple(files: File[]): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  // Get image metadata without uploading
  async getImageMetadata(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  // Update service configuration
  updateConfig(newConfig: Partial<MediaConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const mediaStorageService = new MediaStorageService();
