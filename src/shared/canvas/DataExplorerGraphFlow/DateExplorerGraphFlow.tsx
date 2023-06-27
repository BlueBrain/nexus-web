import React, { useRef, useEffect, CSSProperties } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router';
import { clsx } from 'clsx';
import { RootState } from '../../store/reducers';
import {
  DATA_EXPLORER_GRAPH_FLOW_DIGEST,
  PopulateDataExplorerGraphFlow,
} from '../../store/reducers/data-explorer';
import {
  NavigationBack,
  NavigationHamburguer,
} from '../../molecules/DataExplorerGraphFlowMolecules';
import NavigationStack from '../../organisms/DataExplorerGraphFlowNavigationStack/NavigationStack';
import DataExplorerContentPage from '../../organisms/DataExplorerGraphFlowContent/DataExplorerGraphFlowContent';
import './styles.less';

const DataExplorerGraphFlow = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const digestFirstRender = useRef<boolean>(false);
  const { links, shrinked } = useSelector(
    (state: RootState) => state.dataExplorer
  );

  useEffect(() => {
    if (!digestFirstRender.current) {
      const state = localStorage.getItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST);
      if (state) {
        dispatch(PopulateDataExplorerGraphFlow(state));
      }
    }
    digestFirstRender.current = true;
  }, [location.search, digestFirstRender.current]);

  useEffect(() => {
    const unlisten = history.listen(location => {
      if (!location.pathname.startsWith('/data-explorer/graph-flow')) {
        localStorage.removeItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST);
      }
    });
    return () => unlisten();
  }, []);

  return (
    <div
      className={clsx(
        'data-explorer-resolver',
        shrinked && 'shrinked',
        !links.length ? 'no-links' : 'with-links'
      )}
      style={
        {
          '--links-count': shrinked ? 3 : links.length,
        } as CSSProperties
      }
    >
      <div className="degf__navigation-stack">
        <NavigationStack />
      </div>
      <div className="degf__navigation-back">
        <NavigationHamburguer />
        <NavigationBack />
      </div>
      <div className="degf__content">
        <DataExplorerContentPage />
      </div>
    </div>
  );
};

export default DataExplorerGraphFlow;
