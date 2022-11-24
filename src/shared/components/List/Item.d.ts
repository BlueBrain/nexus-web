import * as React from 'react';
import './Item.less';
declare const Item: React.FunctionComponent<{
  onClick?: () => void;
  actions?: React.ReactElement | React.ReactElement[];
}>;
export default Item;
