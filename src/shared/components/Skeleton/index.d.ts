import * as React from 'react';
import { SkeletonProps } from 'antd/lib/skeleton';
export interface CustomSkeletonProps extends SkeletonProps {
  itemNumber?: number;
}
declare const CustomSkeleton: React.FunctionComponent<CustomSkeletonProps>;
export default CustomSkeleton;
