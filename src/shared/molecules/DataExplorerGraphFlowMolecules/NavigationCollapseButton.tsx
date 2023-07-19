import * as React from 'react';
import { clsx } from 'clsx';
import { Tooltip } from 'antd';
import CollapseIcon from '../../components/Icons/Collapse';
import { TNavigationStackSide } from '../../store/reducers/data-explorer';

const NavigationCollapseButton = ({
  side,
  onExpand,
}: {
  side: TNavigationStackSide;
  onExpand: () => void;
}) => {
  return (
    <Tooltip placement="top" title={`Collapse ${side} side`}>
      <button className={clsx('collapse-btn', side)} onClick={onExpand}>
        <CollapseIcon color="white" />
      </button>
    </Tooltip>
  );
};

export default NavigationCollapseButton;
