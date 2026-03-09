import type { SVGProps } from 'react';

export type IconNode = [elementName: string, attrs: Record<string, string>][];

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
}
