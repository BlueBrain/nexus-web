import * as React from 'react';
import './Types.less';
export interface TypesIconProps {
  type: string;
}
export declare const TypesIcon: React.SFC<TypesIconProps>;
export interface TypesIconListProps {
  type: string[];
  full?: boolean;
}
declare const TypesIconList: React.SFC<TypesIconListProps>;
export default TypesIconList;
