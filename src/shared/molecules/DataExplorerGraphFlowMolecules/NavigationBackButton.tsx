import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { clsx } from 'clsx';
import {
  DATA_EXPLORER_GRAPH_FLOW_DIGEST,
  ResetDataExplorerGraphFlow,
  ReturnBackDataExplorerGraphFlow,
} from '../../store/reducers/data-explorer';
import { RootState } from '../../store/reducers';
import './styles.less';

const NavigationBack = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const { referer } = useSelector((state: RootState) => state.dataExplorer);

  // const onBack = () => {
  //   if (referer?.pathname && !links.length) {
  //     dispatch(ResetDataExplorerGraphFlow({ initialState: null }));
  //     localStorage.removeItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST);
  //     history.push(`${referer.pathname}${referer.search}`, {
  //       ...referer.state,
  //     });
  //     return;
  //   }
  //   history.replace(location.pathname);
  //   dispatch(ReturnBackDataExplorerGraphFlow());
  // };

  // return links.length || !!referer?.pathname ? (
  //   <button
  //     className={clsx(
  //       'navigation-back-btn',
  //       referer?.pathname && !links.length && 'go-back-to-referer'
  //     )}
  //     onClick={onBack}
  //   >
  //     <ArrowLeftOutlined />
  //     <span>Back</span>
  //   </button>
  // ) : null;
  return null;
};

export default NavigationBack;
