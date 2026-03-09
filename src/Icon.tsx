import React from 'react';
import type { IconProps } from './types';

export const Icon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  children,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
};

export default Icon;