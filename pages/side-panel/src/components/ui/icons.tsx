import { Image, Square, Send } from 'lucide-react';

export interface IconProps {
  width?: number;
  height?: number;
  className?: string;
  stroke?: string;
}

export const ImageIcon = ({ width = 12, height = 12, className, stroke = "currentColor" }: IconProps) => (
  <Image
    width={width}
    height={height}
    className={className}
    stroke={stroke}
    strokeWidth="2"
  />
);

export const StopIcon = ({ width = 12, height = 12, className, stroke = "currentColor" }: IconProps) => (
  <Square
    width={width}
    height={height}
    className={className}
    stroke={stroke}
    strokeWidth="2"
  />
);

export const SendIcon = ({ width = 12, height = 12, className, stroke = "currentColor" }: IconProps) => (
  <Send
    width={width}
    height={height}
    className={className}
    stroke={stroke}
    strokeWidth="2"
  />
); 