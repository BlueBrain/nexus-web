import { AppstoreFilled } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.less';

const InternalNavigationItem: React.FC<{
  appKey: string;
  appRoute: string;
  onClickNavigationItem: () => void;
  appIcon: string;
  appLabel: string;
}> = ({ appKey, appRoute, onClickNavigationItem, appIcon, appLabel }) => {
  return (
    <NavigationItemContainer appKey={appKey}>
      <Link to={appRoute} title="" onClick={onClickNavigationItem}>
        <img src={appIcon} className="icon" />
        <div className="navigation-text">{appLabel}</div>
      </Link>
    </NavigationItemContainer>
  );
};

const ExternalNavigationItem: React.FC<{
  appKey: string;
  appURL: string;
  onClickNavigationItem: () => void;
  appIcon: string;
  appLabel: string;
}> = ({ appKey, appURL, onClickNavigationItem, appIcon, appLabel }) => {
  return (
    <NavigationItemContainer appKey={appKey}>
      <a
        title=""
        target="_blank"
        href={appURL || ''}
        onClick={onClickNavigationItem}
      >
        <img src={appIcon} className="icon" />
        <div className="navigation-text">
          {appLabel}
          {<>&#x2197;</>}
        </div>
      </a>
    </NavigationItemContainer>
  );
};

const NavigationItemContainer: React.FC<{
  appKey: string;
  children: React.ReactNode;
}> = ({ appKey, children }) => (
  <div key={appKey} className="navigation__item">
    <Button>{children}</Button>
  </div>
);

const Navigation: React.FC<{ subApps: any; authenticated: boolean }> = ({
  subApps,
  authenticated,
}) => {
  const [navMenuVisible, setNavMenuVisible] = React.useState(false);

  return (
    <Popover
      visible={navMenuVisible}
      onVisibleChange={visible => setNavMenuVisible(visible)}
      content={
        <div>
          <div className="navigation">
            {subApps.map((app: any) => {
              return app.subAppType === 'external' ? (
                <ExternalNavigationItem
                  key={app.key}
                  appKey={app.key}
                  appURL={app.url}
                  appIcon={app.icon}
                  appLabel={app.label}
                  onClickNavigationItem={() => setNavMenuVisible(false)}
                />
              ) : app.requireLogin && !authenticated ? (
                <></>
              ) : (
                <InternalNavigationItem
                  key={app.key}
                  appKey={app.key}
                  appRoute={app.route}
                  appIcon={app.icon}
                  appLabel={app.label}
                  onClickNavigationItem={() => setNavMenuVisible(false)}
                />
              );
            })}
          </div>
        </div>
      }
      trigger="click"
      placement="bottomRight"
    >
      <Button
        className="navigation-button"
        style={{ backgroundColor: 'transparent' }}
        icon={<AppstoreFilled style={{ color: '#fff' }} />}
      ></Button>
    </Popover>
  );
};

export default Navigation;
