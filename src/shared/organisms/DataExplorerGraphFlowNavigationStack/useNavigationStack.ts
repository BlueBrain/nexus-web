import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { RootState } from '../../store/reducers';
import {
  DATA_EXPLORER_GRAPH_FLOW_DIGEST,
  ExpandNavigationStackDataExplorerGraphFlow,
  MoveForwardDataExplorerGraphFlow,
  ResetDataExplorerGraphFlow,
  ReturnBackDataExplorerGraphFlow,
  ShrinkNavigationStackDataExplorerGraphFlow,
} from '../../store/reducers/data-explorer';

const useNavigationStackManager = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const { rightNodes, leftNodes, referer } = useSelector(
    (state: RootState) => state.dataExplorer
  );
  const leftShrinked = leftNodes.shrinked;
  const rightShrinked = rightNodes.shrinked;
  const leftLinks = leftNodes.links;
  const rightLinks = rightNodes.links;

  const onLeftShrink = () =>
    dispatch(ShrinkNavigationStackDataExplorerGraphFlow({ side: 'left' }));
  const onLeftExpand = () =>
    dispatch(ExpandNavigationStackDataExplorerGraphFlow({ side: 'left' }));
  const onRightShrink = () =>
    dispatch(ShrinkNavigationStackDataExplorerGraphFlow({ side: 'right' }));
  const onRightExpand = () =>
    dispatch(ExpandNavigationStackDataExplorerGraphFlow({ side: 'right' }));

  const backArrowVisible = leftLinks.length > 0 || !!referer?.pathname;
  const forwardArrowVisible = rightLinks.length > 0;

  const onNavigateBack = () => {
    if (referer?.pathname && !leftLinks.length) {
      dispatch(ResetDataExplorerGraphFlow({ initialState: null }));
      localStorage.removeItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST);
      history.push(`${referer.pathname}${referer.search}`, {
        ...referer.state,
      });
      return;
    }
    history.replace(location.pathname);
    dispatch(ReturnBackDataExplorerGraphFlow());
  };

  const onNavigateForward = () => {
    history.replace(location.pathname);
    dispatch(MoveForwardDataExplorerGraphFlow());
  };

  return {
    leftShrinked,
    rightShrinked,
    leftLinks,
    rightLinks,
    onLeftShrink,
    onLeftExpand,
    onRightShrink,
    onRightExpand,
    onNavigateBack,
    onNavigateForward,
    backArrowVisible,
    forwardArrowVisible,
  };
};

export default useNavigationStackManager;
