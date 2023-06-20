import * as React from 'react';
import { useLocation, useHistory } from 'react-router';
import { match as pmatch } from 'ts-pattern';
import { Switch } from 'antd';
import './styles.less';

export const advancedModeBlackList = ['/studios', '/studio'];
type TAMLocationState = {
  source: string;
  search: string;
};

const AdvancedModeToggle = () => {
  const history = useHistory();
  const location = useLocation<TAMLocationState>();
  const showToggle = !advancedModeBlackList.includes(location.pathname);

  const onToggle = (checked: boolean) => {
    if (checked) {
      history.push('/data-explorer', {
        source: location.pathname,
        search: location.search,
      });
    } else {
      history.push(
        location.state.source
          ? `${location.state.source}${location.state.search}`
          : '/'
      );
    }
  };
  return pmatch(showToggle)
    .with(true, () => {
      return (
        <div className="advanced-mode-toggle">
          <Switch
            data-testid="advanced-mode-toggle"
            defaultChecked={false}
            checked={location.pathname === '/data-explorer'}
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
