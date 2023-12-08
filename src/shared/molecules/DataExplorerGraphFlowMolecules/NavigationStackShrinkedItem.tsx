import './styles.scss';

import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { clsx } from 'clsx';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TDELink } from 'shared/store/reducers/data-explorer';

import { RootState } from '../../store/reducers';

const BORDER_ITEMS = 2;
const NavigationStackShrinkedItem = ({
  side,
  links,
  shrinked,
  onExpand,
}: {
  side: 'left' | 'right';
  shrinked: boolean;
  links: TDELink[];
  onExpand: () => void;
}) => {
  const count = links.length - BORDER_ITEMS;
  return (
    <div className={clsx('navigation-stack-item', shrinked && 'more', side)} hidden={!shrinked}>
      <div className={clsx('navigation-stack-item__wrapper')}>
        <Tooltip
          placement="bottomRight"
          overlayClassName="navigation-item-tooltip"
          title={<div>Open {count} other resources</div>}
        >
          <PlusOutlined role="open-shrinked-nav" className="icon" onClick={onExpand} />
        </Tooltip>
        <div className="count">{count}</div>
        <MoreOutlined style={{ fontSize: 18, color: '#BFBFBF' }} />
      </div>
    </div>
  );
};

export default NavigationStackShrinkedItem;
