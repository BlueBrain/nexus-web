import { Switch } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'shared/store/reducers';
import { InitDataExplorerGraphFlowFullscreenVersion } from '../../store/reducers/data-explorer';
import './styles.scss';

const DataExplorerGraphFlowContentLimitedHeader = () => {
  const dispatch = useDispatch();
  const { current, fullscreen } = useSelector(
    (state: RootState) => state.dataExplorer
  );
  const onStandardScreen = () =>
    dispatch(InitDataExplorerGraphFlowFullscreenVersion({ fullscreen: false }));

  return (
    <div className="degf-content__header">
      <div className="full-screen-switch__wrapper">
        <span>Fullscreen</span>
        <Switch
          aria-label="fullscreen switch"
          className="full-screen-switch"
          checked={fullscreen}
          onChange={onStandardScreen}
        />
      </div>
      <h1 className="title" aria-label="fullscreen title">
        {current?.title}
      </h1>
    </div>
  );
};

export default DataExplorerGraphFlowContentLimitedHeader;
