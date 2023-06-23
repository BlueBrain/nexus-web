import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShrinkOutlined } from '@ant-design/icons';
import { RootState } from '../../store/reducers';
import {
  MAX_NAVIGATION_ITEMS_IN_STACK,
  ShrinkNavigationStackDataExplorerGraphFlow,
} from '../../store/reducers/data-explorer';
import './styles.less';

const NavigationHamburguer = () => {
  const { shrinked, links } = useSelector(
    (state: RootState) => state.dataExplorer
  );
  const dispatch = useDispatch();
  const onShrink = () => dispatch(ShrinkNavigationStackDataExplorerGraphFlow());
  return !shrinked && links.length > MAX_NAVIGATION_ITEMS_IN_STACK ? (
    <button className="navigation-humburguer" onClick={onShrink}>
      <ShrinkOutlined style={{ fontSize: 18 }} />
    </button>
  ) : null;
};

export default NavigationHamburguer;
