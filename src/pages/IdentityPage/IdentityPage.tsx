import { Realm } from '@bbp/nexus-sdk';
import { Button, Divider } from 'antd';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { performLogin } from '../../shared/store/actions/auth';
import { setPreferredRealm } from '../../shared/store/actions/config';
import { updateAboutModalVisibility } from '../../shared/store/actions/modals';
import { RootState } from '../../shared/store/reducers';
import useClickOutside from '../../shared/hooks/useClickOutside';
import landingPosterImg from '../../shared/images/EPFL_BBP_logo.svg';
import BrainRegionsNexusPage from '../../shared/images/BrainRegionsNexusPage.jpg';
import BrainRegionsNexusPageVideo from '../../shared/videos/BrainRegionsNexusPage.mp4';

import './styles.scss';

const LandingVideo = ({ videoUrl }: { videoUrl: string }) => (
  <video
    loop
    muted
    autoPlay
    className="home-authentication-fusion"
    poster={BrainRegionsNexusPage}
    preload="auto"
    controls={false}
  >
    <source type="video/mp4" src={videoUrl || BrainRegionsNexusPageVideo} />
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
  const auth = useSelector((state: RootState) => state.auth);
  const { layoutSettings, serviceAccountsRealm } = useSelector(
    (state: RootState) => state.config
  );

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
        alt="Landing page poster image"
        src={layoutSettings.landingPosterImg || landingPosterImg}
        className="home-authentication-epfl"
      />
      <LandingVideo videoUrl={layoutSettings.landingVideo} />
      <div className="home-authentication-content">
        <h1 className="title">Nexus.Fusion</h1>
        <nav
          className="actions"
          title="Main navigation"
          aria-label="Main navigation"
        >
          <div className="home-authentication-content-connect">
            {!realmsFilter.length ? (
              <Button
                key="no-realms"
                title="No realms available, please contact your administrator."
                size="large"
                className="no-realms-btn"
              >
                Connect
              </Button>
            ) : (
              <Button
                key="realm-selector"
                size="large"
                title="Select a realm to connect to"
                aria-label="Identity connect"
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
                        dispatch(setPreferredRealm(item.name));
                        dispatch(performLogin());
                      }}
                      className="connect-btn"
                      size="large"
                      type="link"
                      title={`Connect via ${item.name}`}
                      aria-label={`Connect via ${item.name}`}
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
            title="View all available studios"
            onClick={() => history.push('/studios')}
          >
            View Studios
          </Button>
          <Button
            type="link"
            size="large"
            rel="noopener noreferrer"
            target="_blank"
            title="View the documentation for Nexus Fusion"
            href="https://bluebrainnexus.io/docs/index.html"
            className="nav-btn"
          >
            Documentation
          </Button>
          <Button
            className="nav-btn"
            size="large"
            onClick={openAboutModal}
            title="About Nexus Fusion"
          >
            About
          </Button>
        </nav>
      </div>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={
          layoutSettings.logoImgLink ||
          'https://www.epfl.ch/research/domains/bluebrain'
        }
      >
        <img
          alt="Landing page logo"
          src={
            layoutSettings.landingPosterImg ||
            require('../../shared/images/EPFL_BBP_logo.svg')
          }
          className="home-authentication-epfl"
        />
      </a>
      <LandingVideo videoUrl={layoutSettings.landingVideo} />
    </div>
  );
};

export default IdentityPage;
