import * as React from 'react';
import './Studio.less';
declare type StudioItemProps = {
  id: string;
  name: string;
  description?: string;
};
declare const StudioList: React.FC<{
  studios: StudioItemProps[];
  busy?: boolean;
  makeResourceUri(resourceId: string): string;
}>;
export default StudioList;
