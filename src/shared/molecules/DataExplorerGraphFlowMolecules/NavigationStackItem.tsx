import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tag, Tooltip } from 'antd';
import { clsx } from 'clsx';
import { isArray } from 'lodash';
import { PlusOutlined } from '@ant-design/icons';
import {
  TDEResource,
  JumpToNodeDataExplorerGraphFlow,
} from '../../store/reducers/data-explorer';
import { RootState } from '../../store/reducers';
import './styles.less';

export type TNavigationStackItem = {
  _self: string;
  index: number;
  types?: string | string[];
  title: string;
  resource?: TDEResource;
  highlighted: boolean;
};

const NavigationStackItem = ({
  index,
  _self,
  title,
  types,
  resource,
  highlighted,
}: TNavigationStackItem) => {
  const dispatch = useDispatch();
  const { shrinked, links } = useSelector(
    (state: RootState) => state.dataExplorer
  );
  const onClick = () => dispatch(JumpToNodeDataExplorerGraphFlow(index));

  return (
    <div
      className={clsx(
        'navigation-stack-item',
        `item-${index}`,
        highlighted && 'highlight',
        shrinked && index !== 0 && index !== links.length - 1 && 'shrinkable'
      )}
      hidden={shrinked && index !== 0 && index !== links.length - 1}
    >
      <Tooltip
        placement="bottomRight"
        overlayClassName="navigation-item-tooltip"
        title={
          <div>
            <Tag>{`${resource?.[0]}/${resource?.[1]}`}</Tag>
            <span className="tooltip-self">{decodeURIComponent(_self)}</span>
          </div>
        }
      >
        <PlusOutlined className="icon" onClick={onClick} />
      </Tooltip>
      <span className="org-project">{`${resource?.[0]}/${resource?.[1]}`}</span>
      <div className="title">{title}</div>
      {types && (
        <div className="types">{isArray(types) ? types.join(', ') : types}</div>
      )}
    </div>
  );
};

export default NavigationStackItem;
