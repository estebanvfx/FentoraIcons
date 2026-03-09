import React from 'react';
import type { IconNode, IconProps } from './types';

const SVG_ATTR_MAP: Record<string, string> = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
};

// Attrs inherited from the parent SVG — skip them on child elements
const INHERITED = new Set(['stroke', 'strokeWidth', 'stroke-width', 'strokeLinecap', 'strokeLinejoin', 'stroke-linecap', 'stroke-linejoin']);

function mapAttrs(attrs: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (INHERITED.has(key)) continue;
    result[SVG_ATTR_MAP[key] ?? key] = value;
  }
  return result;
}

export default function createLineIcon(
  iconName: string,
  iconNode: IconNode
): React.FC<IconProps> {
  const Component = ({
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
    absoluteStrokeWidth,
    children,
    ...rest
  }: IconProps) => {
    const strokeWidthValue = absoluteStrokeWidth
      ? (Number(strokeWidth) * 24) / Number(size)
      : strokeWidth;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidthValue}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
      >
        {iconNode.map(([tag, attrs], index) => {
          const Tag = tag as keyof JSX.IntrinsicElements;
          return <Tag key={index} {...mapAttrs(attrs)} />;
        })}
        {children}
      </svg>
    );
  };

  Component.displayName = iconName;

  return Component;
}
