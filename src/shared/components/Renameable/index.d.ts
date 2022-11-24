import * as React from 'react';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import './Renameable.less';
interface RenameableItemProps {
  defaultValue: string;
  onChange: (value: string) => void;
  size?: SizeType;
}
declare const RenameableItem: React.FunctionComponent<RenameableItemProps>;
export default RenameableItem;
