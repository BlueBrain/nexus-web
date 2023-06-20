import * as React from 'react';
import { useLocation, useHistory } from 'react-router';
import { match as pmatch } from 'ts-pattern';
import { useSelector, useDispatch } from 'react-redux';
import { Switch } from 'antd';
import { RootState } from '../../store/reducers';
import { UISettingsActionTypes } from '../../store/actions/ui-settings';
import './styles.less';

export const advancedModeBlackList = ['/studios', '/studio', '/data-explorer'];
const AdvancedModeToggle = () => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { isAdvancedModeEnabled } = useSelector(
    (state: RootState) => state.uiSettings
  );
  const showToggle = !advancedModeBlackList.includes(location.pathname);

  const onToggle = () => {
    dispatch({
      type: UISettingsActionTypes.ENABLE_ADVANCED_MODE,
    });
    history.push('/data-explorer');
  };

  React.useEffect(() => {
    history.listen(location => {
      if (location.pathname !== '/data-explorer' && isAdvancedModeEnabled) {
        dispatch({
          type: UISettingsActionTypes.ENABLE_ADVANCED_MODE,
          payload: false,
        });
      }
    });
  }, [history, isAdvancedModeEnabled]);

  return pmatch(showToggle)
    .with(true, () => {
      return (
        <div className="advanced-mode-toggle">
          <Switch
            data-testid="advanced-mode-toggle"
            defaultChecked={false}
            checked={isAdvancedModeEnabled}
            onClick={onToggle}
          />
          <span className="advanced">Advanced Mode</span>
          <span className="beta">Beta</span>
        </div>
      );
    })
    .otherwise(() => <></>);
};

export default AdvancedModeToggle;
