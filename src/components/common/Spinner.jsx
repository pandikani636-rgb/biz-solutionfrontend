import React from 'react';
import { GranderBeltPreloader } from './GranderBeltPreloader';

/**
 * Animated Grander Belt Preloader
 * Replaces generic spinner with authentic industrial Grander drive belt animation.
 */
export const Spinner = ({ size = 'md', className = '', text = 'Loading...' }) => {
  return (
    <div className={`flex items-center justify-center p-3 ${className}`}>
      <GranderBeltPreloader size={size} text={text} />
    </div>
  );
};
