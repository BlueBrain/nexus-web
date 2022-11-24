import * as React from 'react';
export interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}
export default function useMeasure(): [
  {
    ref: React.MutableRefObject<HTMLDivElement>;
  },
  Bounds
];
