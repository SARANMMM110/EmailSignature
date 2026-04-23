import { BRAND_NAME } from '../constants/brand.js';

/** Wordmark: “Signature” + accent “Studio”. Matches {@link BRAND_NAME}. */
export function BrandLockup({ accentClassName = 'text-blue-600', className = '' }) {
  return (
    <span className={className}>
      Signature<span className={accentClassName}> Studio</span>
    </span>
  );
}
