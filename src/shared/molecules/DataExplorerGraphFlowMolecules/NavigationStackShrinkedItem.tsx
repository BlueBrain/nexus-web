import React from 'react';
import { Tooltip } from 'antd';
import { clsx } from 'clsx';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/reducers';
import { ExpandNavigationStackDataExplorerGraphFlow } from '../../store/reducers/data-explorer';
import './styles.less';

const BORDER_ITEMS = 2;
const NavigationStackShrinkedItem = () => {
  const { links, shrinked, highlightIndex } = useSelector(
    (state: RootState) => state.dataExplorer
  );
  const dispatch = useDispatch();
  const count = links.length - BORDER_ITEMS;
  const onClick = () => dispatch(ExpandNavigationStackDataExplorerGraphFlow());
  return (
    <div
      className={clsx(
        'navigation-stack-item',
        shrinked ? 'more' : 'no-more',
        shrinked && highlightIndex !== -1 && 'highlight'
      )}
    >
      <Tooltip
        placement="bottomRight"
        overlayClassName="navigation-item-tooltip"
        title={<div>Open more {count} other resources</div>}
      >
        <PlusOutlined className="icon" onClick={onClick} />
      </Tooltip>
      <div className="count">{count}</div>
      <MoreOutlined style={{ fontSize: 18, color: '#BFBFBF' }} />
    </div>
  );
};

export default NavigationStackShrinkedItem;
