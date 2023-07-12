import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { RootState } from '../../store/reducers';
import {
  ExpandNavigationStackDataExplorerGraphFlow,
  ShrinkNavigationStackDataExplorerGraphFlow,
} from '../../store/reducers/data-explorer';

const useNavigationStackManager = () => {
  const dispatch = useDispatch();
  const { rightNodes, leftNodes } = useSelector(
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

  return {
    leftShrinked,
    rightShrinked,
    leftLinks,
    rightLinks,
    onLeftShrink,
    onLeftExpand,
    onRightShrink,
    onRightExpand,
  };
};

export default useNavigationStackManager;
