import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { Space, Tag, Tooltip } from 'antd';
import { clsx } from 'clsx';
import { isArray } from 'lodash';
import { FullscreenOutlined } from '@ant-design/icons';
import {
  TDEResource,
  JumpToNodeDataExplorerGraphFlow,
  TNavigationStackSide,
  MAX_NAVIGATION_ITEMS_IN_STACK,
} from '../../store/reducers/data-explorer';
import { RootState } from '../../store/reducers';
import useNavigationStackManager from '../../organisms/DataExplorerGraphFlowNavigationStack/useNavigationStack';
import NavigationCollapseButton from './NavigationCollapseButton';
import './styles.scss';

export type TNavigationStackItem = {
  _self: string;
  index: number;
  types?: string | string[];
  title: string;
  resource?: TDEResource;
  side: TNavigationStackSide;
};

const NavigationStackItem = ({
  index,
  _self,
  title,
  types,
  resource,
  side,
}: TNavigationStackItem) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const { leftNodes, rightNodes } = useSelector(
    (state: RootState) => state.dataExplorer
  );
  const {
    onRightShrink,
    onLeftShrink,
    leftShrinked,
    rightShrinked,
  } = useNavigationStackManager();

  const onClick = () => {
    dispatch(JumpToNodeDataExplorerGraphFlow({ index, side }));
    history.replace(location.pathname);
  };

  const parentNode = side === 'left' ? leftNodes : rightNodes;
  const orgProject =
    resource?.[0] && resource?.[1] && `${resource?.[0]}/${resource?.[1]}`;
  const showLeftCollapseBtn =
    side === 'left' &&
    !leftShrinked &&
    leftNodes.links.length > MAX_NAVIGATION_ITEMS_IN_STACK &&
    leftNodes.links.length - 1 === index;
  const showRightCollapseBtn =
    side === 'right' &&
    !rightShrinked &&
    rightNodes.links.length > MAX_NAVIGATION_ITEMS_IN_STACK &&
    index === 0;

  const collapseRightBtn = React.useCallback(() => {
    return (
      showRightCollapseBtn && (
        <NavigationCollapseButton side={side} onExpand={onRightShrink} />
      )
    );
  }, [showRightCollapseBtn, side, onRightShrink]);

  const collapseLeftBtn = React.useCallback(() => {
    return (
      showLeftCollapseBtn && (
        <NavigationCollapseButton side={side} onExpand={onLeftShrink} />
      )
    );
  }, [showLeftCollapseBtn, side, onLeftShrink]);

  return (
    <div
      className={clsx(
        'navigation-stack-item',
        `item-${index}`,
        side,
        parentNode.shrinked &&
          index !== 0 &&
          index !== parentNode.links.length - 1 &&
          'shrinkable'
      )}
      hidden={
        parentNode.shrinked &&
        index !== 0 &&
        index !== parentNode.links.length - 1
      }
    >
      {collapseRightBtn()}
      <div className="navigation-stack-item__wrapper" onClick={onClick}>
        {orgProject && <span className="org-project">{orgProject}</span>}
        {title && <div className="title">{title}</div>}
        {types && (
          <div className="types">
            {isArray(types) ? (
              <Space size="middle">
                {types.map(t => (
                  <span>{t}</span>
                ))}
              </Space>
            ) : (
              types
            )}
          </div>
        )}
      </div>
      {collapseLeftBtn()}
    </div>
  );
};

export default NavigationStackItem;
