import React, { useRef, useState } from 'react';
import { Button, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Realm } from '@bbp/nexus-sdk';
import { updateAboutModalVisibility } from '../../shared/store/actions/modals';
import { RootState } from '../../shared/store/reducers';
import useClickOutside from '../../shared/hooks/useClickOutside';
import * as authActions from '../../shared/store/actions/auth';
import * as configActions from '../../shared/store/actions/config';

import './styles.less';

const LandingVideo = ({ videoUrl }: { videoUrl: string }) => (
  <video
    loop
    muted
    autoPlay
    className="home-authentication-fusion"
    poster={require('../../shared/images/BrainRegionsNexusPage.jpg')}
    preload="auto"
    controls={false}
  >
    <source
      type="video/mp4"
      src={videoUrl || require('../../shared/images/BrainRegionsNexusPage.mp4')}
    />
  </video>
);

export type TLocationState = {
  from: string;
  searchQuery: string;
  [key: string]: any;
};
const IdentityPage: React.FC<{}> = () => {
  const popoverRef = useRef(null);
  const history = useHistory();
  const dispatch = useDispatch<any>();
  const location = useLocation();
  const { layoutSettings } = useSelector((state: RootState) => state.config);
  const {
    auth,
    config: { serviceAccountsRealm },
  } = useSelector((state: RootState) => ({
    auth: state.auth,
    config: state.config,
  }));
  const realms: Realm[] =
    (auth.realms && auth.realms.data && auth.realms.data._results) || [];

  const [connectBtnState, setConnectBtnState] = useState<boolean>(false);
  const onPopoverVisibleChange = (state: boolean) => setConnectBtnState(state);
  const realmsFilter = realms.filter(
    r => r._label !== serviceAccountsRealm && !r._deprecated
  );
  const openAboutModal = () => dispatch(updateAboutModalVisibility(true));
  useClickOutside(popoverRef, () => onPopoverVisibleChange(false));
  return (
    <div
      className="home-authentication"
      style={{ backgroundColor: layoutSettings.mainColor }}
    >
      <img
        src={
          layoutSettings.landingPosterImg ||
          require('../../shared/images/EPFL_BBP_logo.png')
        }
        className="home-authentication-epfl"
      />
      <LandingVideo videoUrl={layoutSettings.landingVideo} />
      <div className="home-authentication-content">
        <div className="title">Nexus.Fusion</div>
        <div className="actions">
          <div className="home-authentication-content-connect">
            {!realmsFilter.length ? (
              <Button
                key="no-realms"
                disabled
                role="button"
                size="large"
                className="no-realms-btn"
              >
                Connect
              </Button>
            ) : (
              <Button
                key="realm-selector"
                size="large"
                role="button"
                aria-label="identity-login"
                onClick={() => onPopoverVisibleChange(true)}
              >
                Connect
                {connectBtnState ? (
                  <UpOutlined size={13} />
                ) : (
                  <DownOutlined size={13} />
                )}
              </Button>
            )}
            {connectBtnState && realmsFilter.length && (
              <ul
                ref={popoverRef}
                className="home-authentication-content-connect-popover"
              >
                {realmsFilter.map(item => (
                  <li
                    key={`realm-btn-${item['@id']}`}
                    className="realm-connect"
                  >
                    <Button
                      onClick={e => {
                        e.preventDefault();
                        dispatch(configActions.setPreferredRealm(item.name));
                        console.log('$$$ UseLocation', location);
                        dispatch(
                          authActions.performLogin(
                            location.state as TLocationState
                          )
                        );
                      }}
                      className="connect-btn"
                      size="large"
                      type="link"
                      role="button"
                    >
                      {item.name}
                    </Button>
                    <Divider />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            className="nav-btn"
            size="large"
            onClick={() => history.push('/studios')}
          >
            View Studios
          </Button>
          <Button
            type="link"
            size="large"
            rel="noopener noreferrer"
            target="_blank"
            href="https://bluebrainnexus.io/docs/index.html"
            className="nav-btn"
          >
            Documentation
          </Button>
          <Button className="nav-btn" size="large" onClick={openAboutModal}>
            About
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IdentityPage;
