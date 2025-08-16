import React, { useState, useRef, useEffect, useCallback } from 'react';

// Image optimization utilities
export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export class ImageOptimizer {
  private static cache = new Map<string, string>();

  // Generate optimized image URL (for use with image optimization service)
  static getOptimizedUrl(src: string, options: ImageOptimizationOptions = {}): string {
    const {
      quality = 80,
      format = 'webp',
      width,
      height,
      fit = 'cover'
    } = options;

    // If it's already an optimized URL or external URL, return as-is
    if (src.includes('?') || src.startsWith('http')) {
      return src;
    }

    const params = new URLSearchParams();
    params.set('q', quality.toString());
    params.set('f', format);
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('fit', fit);

    return `${src}?${params.toString()}`;
  }

  // Convert image to WebP format (client-side)
  static async convertToWebP(file: File, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        }, 'image/webp', quality);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Resize image (client-side)
  static async resizeImage(
    file: File, 
    maxWidth: number, 
    maxHeight: number, 
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        // Use high-quality scaling
        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = 'high';
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to resize image'));
          }
        }, 'image/webp', quality);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Generate responsive image srcSet
  static generateSrcSet(src: string, sizes: number[]): string {
    return sizes
      .map(size => `${this.getOptimizedUrl(src, { width: size })} ${size}w`)
      .join(', ');
  }

  // Preload critical images
  static preloadImage(src: string, options: ImageOptimizationOptions = {}): Promise<void> {
    const optimizedSrc = this.getOptimizedUrl(src, options);
    
    if (this.cache.has(optimizedSrc)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(optimizedSrc, optimizedSrc);
        resolve();
      };
      img.onerror = reject;
      img.src = optimizedSrc;
    });
  }
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options]);

  return [ref, isIntersecting];
}

// Lazy loading image component
export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  optimization?: ImageOptimizationOptions;
  sizes?: string;
  responsiveSizes?: number[];
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  optimization = {},
  sizes,
  responsiveSizes = [320, 640, 768, 1024, 1280, 1920],
  onLoad,
  onError,
  className = '',
  loadingClassName = '',
  errorClassName = '',
  ...props
}) => {
  const [ref, isIntersecting] = useIntersectionObserver();
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState<string>('');

  // Load image when it comes into view
  useEffect(() => {
    if (isIntersecting && !imageSrc) {
      const optimizedSrc = ImageOptimizer.getOptimizedUrl(src, optimization);
      setImageSrc(optimizedSrc);
    }
  }, [isIntersecting, src, optimization, imageSrc]);

  const handleLoad = useCallback(() => {
    setImageState('loaded');
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageState('error');
    onError?.();
  }, [onError]);

  // Generate srcSet for responsive images
  const srcSet = responsiveSizes.length > 0 
    ? ImageOptimizer.generateSrcSet(src, responsiveSizes)
    : undefined;

  const getClassName = () => {
    let classes = className;
    if (imageState === 'loading') classes += ` ${loadingClassName}`;
    if (imageState === 'error') classes += ` ${errorClassName}`;
    return classes.trim();
  };

  return (
    <div ref={ref} className="lazy-image-container">
      {!isIntersecting || imageState === 'loading' ? (
        <div className={`lazy-image-placeholder ${loadingClassName}`}>
          {placeholder ? (
            <img src={placeholder} alt={alt} className="placeholder-image" />
          ) : (
            <div className="placeholder-skeleton" />
          )}
        </div>
      ) : (
        <img
          src={imageSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={getClassName()}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

// Progressive image component with blur-up effect
export interface ProgressiveImageProps extends LazyImageProps {
  lowQualitySrc?: string;
  blurAmount?: number;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  lowQualitySrc,
  blurAmount = 10,
  ...props
}) => {
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [lowResLoaded, setLowResLoaded] = useState(false);

  // Generate low quality placeholder if not provided
  const placeholder = lowQualitySrc || ImageOptimizer.getOptimizedUrl(src, {
    quality: 20,
    width: 50
  });

  useEffect(() => {
    // Preload low quality image
    const img = new Image();
    img.onload = () => setLowResLoaded(true);
    img.src = placeholder;
  }, [placeholder]);

  return (
    <div className="progressive-image-container" style={{ position: 'relative' }}>
      {/* Low quality placeholder */}
      {lowResLoaded && !highResLoaded && (
        <img
          src={placeholder}
          alt={props.alt}
          className="progressive-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            filter: `blur(${blurAmount}px)`,
            transition: 'opacity 0.3s ease',
            opacity: highResLoaded ? 0 : 1
          }}
        />
      )}
      
      {/* High quality image */}
      <LazyImage
        {...props}
        src={src}
        onLoad={() => {
          setHighResLoaded(true);
          props.onLoad?.();
        }}
        style={{
          ...props.style,
          transition: 'opacity 0.3s ease',
          opacity: highResLoaded ? 1 : 0
        }}
      />
    </div>
  );
};

// Image gallery with lazy loading and optimization
export interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: number;
  gap?: number;
  optimization?: ImageOptimizationOptions;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  columns = 3,
  gap = 16,
  optimization = { quality: 85, format: 'webp' }
}) => {
  return (
    <div 
      className="image-gallery"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {images.map((image, index) => (
        <div key={index} className="gallery-item">
          <ProgressiveImage
            src={image.src}
            alt={image.alt}
            optimization={optimization}
            responsiveSizes={[300, 600, 900]}
            sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${100/columns}vw`}
            className="gallery-image"
          />
          {image.caption && (
            <p className="gallery-caption">{image.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
};

// Image upload with optimization
export interface ImageUploaderProps {
  onUpload: (file: Blob, originalFile: File) => void;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // in bytes
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 10 * 1024 * 1024 // 10MB
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setIsProcessing(true);

    try {
      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} not supported`);
      }

      // Validate file size
      if (file.size > maxFileSize) {
        throw new Error(`File size exceeds ${maxFileSize / 1024 / 1024}MB limit`);
      }

      // Optimize image
      const optimizedBlob = await ImageOptimizer.resizeImage(
        file,
        maxWidth,
        maxHeight,
        quality
      );

      onUpload(optimizedBlob, file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        disabled={isProcessing}
        className="file-input"
      />
      
      {isProcessing && (
        <div className="processing-indicator">
          Processing image...
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

// CSS for image components (to be added to your global styles)
export const imageOptimizationStyles = `
.lazy-image-container {
  position: relative;
  overflow: hidden;
}

.lazy-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  min-height: 200px;
}

.placeholder-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.placeholder-image {
  filter: blur(5px);
  opacity: 0.7;
}

.progressive-image-container {
  position: relative;
  overflow: hidden;
}

.progressive-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.gallery-image:hover {
  transform: scale(1.02);
}

.gallery-caption {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

.image-uploader {
  padding: 20px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  text-align: center;
}

.processing-indicator {
  margin-top: 10px;
  color: #666;
}

.error-message {
  margin-top: 10px;
  color: #e74c3c;
  font-size: 0.9rem;
}
`;