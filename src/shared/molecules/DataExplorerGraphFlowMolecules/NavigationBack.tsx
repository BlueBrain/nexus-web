import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ReturnBackDataExplorerGraphFlow } from '../../store/reducers/data-explorer';
import { RootState } from '../../store/reducers';
import './styles.less';

const NavigationBack = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { links } = useSelector((state: RootState) => state.dataExplorer);
  const onBack = () => {
    history.replace(location.pathname);
    dispatch(ReturnBackDataExplorerGraphFlow());
  };
  return links.length ? (
    <button className="navigation-back-btn" onClick={onBack}>
      <ArrowLeftOutlined />
      <span>Back</span>
    </button>
  ) : null;
};

export default NavigationBack;
