import React, { useRef, useState } from 'react';
import { Button, Divider } from 'antd';
import { connect } from 'react-redux';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Realm } from '@bbp/nexus-sdk';
import useClickOutside from '../../shared/hooks/useClickOutside';
import { RootState } from '../../shared/store/reducers';
import * as authActions from '../../shared/store/actions/auth';
import * as configActions from '../../shared/store/actions/config';

import './styles.less';
import { useHistory } from 'react-router';

type Props = {
  realms: Realm[];
  serviceAccountsRealm: string;
  performLogin(realmName: string): void;
};
const LandingVideo = () => (
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
      src={require('../../shared/images/BrainRegionsNexusPage.mp4')}
    />
  </video>
);
function LandingPage({ realms, serviceAccountsRealm, performLogin }: Props) {
  const popoverRef = useRef(null);
  const history = useHistory();
  const [connectBtnState, setConnectBtnState] = useState<boolean>(false);
  const onPopoverVisibleChange = () => setConnectBtnState(state => !state);
  const realmsFilter = realms.filter(
    r => r._label !== serviceAccountsRealm && !r._deprecated
  );
  useClickOutside(popoverRef, onPopoverVisibleChange);
  return (
    <div className="home-authentication">
      <img
        src={require('../../shared/images/EPFL_BBP_logo.png')}
        className="home-authentication-epfl"
      />
      <LandingVideo />
      <div className="home-authentication-content">
        <div className="title">Nexus.Fusion</div>
        <div className="actions">
          <div className="home-authentication-content-connect">
            {realmsFilter.length === 1 ? (
              <Button
                onClick={e => {
                  e.preventDefault();
                  performLogin(realmsFilter?.[0].name);
                }}
                className="connect-btn"
                size="large"
                type="link"
              >
                Connect
              </Button>
            ) : (
              <Button size="large" onClick={onPopoverVisibleChange}>
                Connect
                {connectBtnState ? (
                  <UpOutlined size={13} />
                ) : (
                  <DownOutlined size={13} />
                )}
              </Button>
            )}
            {connectBtnState && realmsFilter.length > 1 && (
              <div
                ref={popoverRef}
                className="home-authentication-content-connect-popover"
              >
                {realmsFilter.length > 1 &&
                  realmsFilter.map(item => (
                    <div className="realm-connect">
                      <Button
                        onClick={e => {
                          e.preventDefault();
                          performLogin(item.name);
                        }}
                        className="connect-btn"
                        size="large"
                        type="link"
                      >
                        {item.name}
                      </Button>
                      <Divider />
                    </div>
                  ))}
              </div>
            )}
          </div>
          <Button size="large" onClick={() => history.push('/studios')}>
            View Studios
          </Button>
          <Button size="large">Documentation</Button>
          <Button size="large">About</Button>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: RootState) => {
  const { auth, config } = state;
  const realms: Realm[] =
    (auth.realms && auth.realms.data && auth.realms.data._results) || [];
  const { serviceAccountsRealm } = config;

  return {
    realms,
    serviceAccountsRealm,
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  setPreferredRealm: (name: string) => {
    dispatch(configActions.setPreferredRealm(name));
  },
  performLogin: () => {
    dispatch(authActions.performLogin());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
