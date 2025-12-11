'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

/**
 * AIImage - A wrapper around Next.js Image component that handles AWS S3 signed URLs
 * 
 * AWS S3 signed URLs from AliveAI (files.aliveai.app) fail with 403 when proxied through
 * Next.js Image Optimization because:
 * 1. The signature is tied to the original requester's IP/headers
 * 2. When Next.js server fetches the image, AWS rejects the request
 * 
 * This component detects AliveAI URLs and uses unoptimized mode for them,
 * while still allowing optimization for other images.
 */

// Domains that use AWS S3 signed URLs and need unoptimized mode
const SIGNED_URL_DOMAINS = [
  'files.aliveai.app',
  'cdn.aliveai.app',
];

/**
 * Check if a URL is from a domain that uses AWS S3 signed URLs
 */
function isSignedUrl(src: string | undefined): boolean {
  if (!src || typeof src !== 'string') return false;
  
  try {
    const url = new URL(src);
    return SIGNED_URL_DOMAINS.some(domain => url.hostname === domain);
  } catch {
    // Not a valid URL (might be a relative path)
    return false;
  }
}

/**
 * Check if URL has AWS signature parameters (additional check)
 */
function hasAwsSignature(src: string): boolean {
  return src.includes('X-Amz-Signature') || src.includes('X-Amz-Credential');
}

interface AIImageProps extends Omit<ImageProps, 'src'> {
  src: string | undefined;
  fallbackSrc?: string;
}

/**
 * AIImage Component
 * 
 * Use this component instead of next/image when displaying images that may come from
 * AliveAI or other AWS S3 signed URL sources.
 * 
 * @example
 * <AIImage 
 *   src={model.avatar_url} 
 *   fallbackSrc="/images/default-avatar.png"
 *   alt="AI Model"
 *   fill
 *   className="object-cover"
 * />
 */
export default function AIImage({ 
  src, 
  fallbackSrc = '/images/default-avatar.png',
  alt,
  ...props 
}: AIImageProps) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  // Determine if this URL needs unoptimized mode
  const needsUnoptimized = src ? (isSignedUrl(src) || hasAwsSignature(src)) : false;

  // Handle image load error
  const handleError = () => {
    if (!error && fallbackSrc) {
      setError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Update imgSrc when src prop changes
  if (src && src !== imgSrc && !error) {
    setImgSrc(src);
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      unoptimized={needsUnoptimized || error}
      onError={handleError}
    />
  );
}

/**
 * Hook to check if an image URL is from AliveAI
 */
export function useIsAliveAIImage(src: string | undefined): boolean {
  return isSignedUrl(src);
}

/**
 * Utility function to check if image should be unoptimized
 * Use this if you need to manually set unoptimized prop
 */
export function shouldUseUnoptimized(src: string | undefined): boolean {
  if (!src) return false;
  return isSignedUrl(src) || hasAwsSignature(src);
}

