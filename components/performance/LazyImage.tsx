import React, { useState, useRef, useEffect } from 'react';
import { useLazyImage, useConnectionStatus } from '../../hooks/usePerformance';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  blurDataURL,
  priority = false,
  quality = 80,
  sizes,
  className = '',
  style,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { shouldReduceData } = useConnectionStatus();
  
  // Use lazy loading unless it's a priority image
  const { imgRef, src: lazySrc, isInView } = useLazyImage(
    src,
    priority ? undefined : { rootMargin: '50px' }
  );

  // Generate optimized image URL
  const getOptimizedSrc = (originalSrc: string) => {
    if (shouldReduceData) {
      // Reduce quality for slow connections
      return `${originalSrc}?q=${Math.max(30, quality - 30)}&f=webp`;
    }
    return `${originalSrc}?q=${quality}&f=auto`;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // For priority images, load immediately
  const shouldLoad = priority || isInView;
  const imageSrc = shouldLoad ? getOptimizedSrc(lazySrc || src) : undefined;

  return (
    <div 
      className={`lazy-image-container ${className}`}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {/* Placeholder/blur image */}
      {!isLoaded && (blurDataURL || placeholder) && (
        <img
          src={blurDataURL || placeholder}
          alt=""
          className="lazy-image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: blurDataURL ? 'blur(10px)' : 'none',
            transition: 'opacity 0.3s ease',
            opacity: isLoaded ? 0 : 1
          }}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && !placeholder && !blurDataURL && (
        <div
          className="lazy-image-skeleton"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      )}

      {/* Main image */}
      {shouldLoad && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease',
            opacity: isLoaded ? 1 : 0
          }}
          {...props}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div
          className="lazy-image-error"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
            color: '#666',
            fontSize: '14px'
          }}
        >
          Failed to load image
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

// Progressive image component with multiple sources
interface ProgressiveImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  lowQualitySrc?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  srcSet,
  sizes,
  alt,
  lowQualitySrc,
  className,
  style
}) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    if (lowQualitySrc && src !== lowQualitySrc) {
      // Preload high quality image
      const img = new Image();
      img.onload = () => {
        setCurrentSrc(src);
        setIsHighQualityLoaded(true);
      };
      img.src = src;
      if (srcSet) img.srcset = srcSet;
    }
  }, [src, srcSet, lowQualitySrc]);

  return (
    <img
      src={currentSrc}
      srcSet={isHighQualityLoaded ? srcSet : undefined}
      sizes={sizes}
      alt={alt}
      className={className}
      style={{
        filter: !isHighQualityLoaded && lowQualitySrc ? 'blur(2px)' : 'none',
        transition: 'filter 0.3s ease',
        ...style
      }}
    />
  );
};

// Image gallery with virtual scrolling
interface VirtualImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    thumbnail?: string;
  }>;
  itemHeight: number;
  containerHeight: number;
  onImageClick?: (index: number) => void;
}

export const VirtualImageGallery: React.FC<VirtualImageGalleryProps> = ({
  images,
  itemHeight,
  containerHeight,
  onImageClick
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    images.length - 1
  );

  const startIndex = Math.max(0, visibleStart - 2);
  const endIndex = Math.min(images.length - 1, visibleEnd + 2);

  const visibleImages = images.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  const totalHeight = images.length * itemHeight;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleImages.map((image, index) => {
            const actualIndex = startIndex + index;
            return (
              <div
                key={actualIndex}
                style={{
                  height: itemHeight,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => onImageClick?.(actualIndex)}
              >
                <LazyImage
                  src={image.src}
                  alt={image.alt}
                  placeholder={image.thumbnail}
                  style={{
                    width: itemHeight - 16,
                    height: itemHeight - 16,
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
                <span style={{ marginLeft: '12px', fontSize: '14px' }}>
                  {image.alt}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};