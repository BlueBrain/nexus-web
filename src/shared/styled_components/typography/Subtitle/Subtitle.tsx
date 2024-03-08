import React, { ReactChild, ReactChildren } from 'react';
import './Subtitle.scss';

interface SubtitleProps {
  className?: string;
}

export const Subtitle = ({
  children,
  className,
}: React.PropsWithChildren<SubtitleProps>) => {
  return <h4 className={`subtitle ${className}`}>{children}</h4>;
};
