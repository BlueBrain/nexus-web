import React from 'react';
import { useHistory } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ReturnBackDataExplorerGraphFlow } from '../../store/reducers/data-explorer';
import { RootState } from '../../store/reducers';
import './styles.less';

const NavigationBack = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { links } = useSelector((state: RootState) => state.dataExplorer);
  const onBack = () => {
    dispatch(ReturnBackDataExplorerGraphFlow());
    history.replace(location.pathname);
  };
  if (links.length) {
    return (
      <button className="navigation-back-btn" onClick={onBack}>
        <ArrowLeftOutlined />
        <span>Back</span>
      </button>
    );
  }
  return null;
};

export default NavigationBack;
