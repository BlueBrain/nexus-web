import React, { useRef, useEffect, CSSProperties } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router';
import { clsx } from 'clsx';
import { RootState } from '../../store/reducers';
import {
  DATA_EXPLORER_GRAPH_FLOW_DIGEST,
  DATA_EXPLORER_GRAPH_FLOW_PATH,
  PopulateDataExplorerGraphFlow,
  ResetDataExplorerGraphFlow,
  DataExplorerFlowSliceListener,
  DataExplorerMiddlewareMatcher,
  calculateDateExplorerGraphFlowDigest,
} from '../../store/reducers/data-explorer';
import {
  NavigationArrows,
  NavigationStack,
} from '../../organisms/DataExplorerGraphFlowNavigationStack';
import DataExplorerContentPage from '../../organisms/DataExplorerGraphFlowContent/DataExplorerGraphFlowContent';
import useNavigationStackManager from '../../organisms/DataExplorerGraphFlowNavigationStack/useNavigationStack';
import ResourceResolutionCache from '../../components/ResourceEditor/ResourcesLRUCache';
import DataExplorerGraphFlowEmpty from './DataExplorerGraphFlowEmpty';

import './styles.less';

const DataExplorerGraphFlow = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const digestFirstRender = useRef<boolean>(false);
  const { current, rightNodes, leftNodes } = useSelector(
    (state: RootState) => state.dataExplorer
  );

  const {
    leftShrinked,
    rightShrinked,
    leftLinks,
    rightLinks,
  } = useNavigationStackManager();

  useEffect(() => {
    if (!digestFirstRender.current) {
      const state = sessionStorage.getItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST);
      if (state) {
        dispatch(PopulateDataExplorerGraphFlow(state));
      }
    }
    digestFirstRender.current = true;
  }, [location.search, digestFirstRender.current]);

  useEffect(() => {
    const unlisten = history.listen(location => {
      if (!location.pathname.startsWith(DATA_EXPLORER_GRAPH_FLOW_PATH)) {
        dispatch(ResetDataExplorerGraphFlow({ initialState: null }));
        sessionStorage.removeItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST);
      }
    });
    return () => unlisten();
  }, []);

  useEffect(() => {
    return () => {
      ResourceResolutionCache.clear();
    };
  }, [ResourceResolutionCache]);

  useEffect(() => {
    DataExplorerFlowSliceListener.startListening({
      matcher: DataExplorerMiddlewareMatcher,
      effect: (_, api) => {
        const state = (api.getState() as RootState).dataExplorer;
        calculateDateExplorerGraphFlowDigest(state);
      },
    });
    return () => {
      DataExplorerFlowSliceListener.clearListeners();
    };
  }, []);
  return !current ? (
    <DataExplorerGraphFlowEmpty />
  ) : (
    <div
      className={clsx(
        'data-explorer-resolver',
        leftLinks.length && 'left-existed',
        rightLinks.length && 'right-existed',
        !leftNodes.links.length && !rightNodes.links.length
          ? 'no-links'
          : 'with-links'
      )}
      style={
        {
          '--left--links-count': leftShrinked ? 3 : leftNodes.links.length,
          '--right--links-count': rightShrinked ? 3 : rightNodes.links.length,
        } as CSSProperties
      }
    >
      {!!leftLinks.length && (
        <div className="degf__navigation-stack">
          <NavigationStack key="navigation-stack-left" side="left" />
        </div>
      )}
      <div className="degf__content">
        <NavigationArrows />
        <DataExplorerContentPage />
      </div>
      {!!rightLinks.length && (
        <div className="degf__navigation-stack">
          <NavigationStack key="navigation-stack-right" side="right" />
        </div>
      )}
    </div>
  );
};

export default DataExplorerGraphFlow;
