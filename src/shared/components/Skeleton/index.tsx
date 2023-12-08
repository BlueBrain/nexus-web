import { List, Skeleton } from 'antd';
import { SkeletonProps } from 'antd/lib/skeleton';
import * as React from 'react';

export interface CustomSkeletonProps extends SkeletonProps {
  itemNumber?: number;
}

const CustomSkeleton: React.FunctionComponent<CustomSkeletonProps> = ({
  itemNumber = 1,
  ...rest
}) => {
  const s = [];
  for (let i = 0; i < itemNumber; i += 1) {
    s.push(<Skeleton key={i} {...rest} />);
  }
  return <React.Fragment>{s}</React.Fragment>;
};

export default CustomSkeleton;
