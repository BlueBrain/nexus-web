import * as React from 'react';
import './ActionButton.less';
declare const ActionButton: React.FC<{
  title?: string;
  onClick(): void;
  icon?: 'add' | string;
  highlighted?: boolean;
}>;
export default ActionButton;
