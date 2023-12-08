import './styles.scss';

import { GithubOutlined } from '@ant-design/icons';
import { Button, Divider, Modal, Tooltip } from 'antd';
import * as React from 'react';
import { parseUserAgent } from 'react-device-detect';
import { useDispatch, useSelector } from 'react-redux';

import { url as githubIssueURL } from '../../../../package.json';
import Copy from '../../../shared/components/Copy';
import { CopyIcon } from '../../../shared/components/Icons/CopyIcon';
import { updateAboutModalVisibility } from '../../../shared/store/actions/modals';
import { RootState } from '../../../shared/store/reducers';
import { Subtitle } from '../../../shared/styled_components/typography/Subtitle/Subtitle';
import bbpLogo from '../../images/EPFL_BBP_logo.png';

declare let FUSION_VERSION: string;
declare let COMMIT_HASH: string;

const repoUrl = 'https://github.com/BlueBrain/nexus-web';

export type TNexusEco = {
  delta: string;
  environment: string;
  [key: string]: any;
};
export interface EnvironmentInfo {
  deltaVersion: string;
  fusionVersion: string;
  environmentName: string;
  operatingSystem: string;
  browser: string;
}

const envInfoForClipboard = (env: EnvironmentInfo) => {
  return `
      Delta: ${env.deltaVersion}
      Fusion: ${env.fusionVersion}
      Environment: ${env.environmentName}

      Platform Information:
      Operating System: ${env.operatingSystem}
      Browser: ${env.browser}
    `;
};

const releaseNoteUrl = 'https://github.com/BlueBrain/nexus-web/releases';

const AppInfo: React.FC<TNexusEco> = ({ delta, environment: infraEnv }) => {
  const dispatch = useDispatch();
  const modals = useSelector((state: RootState) => state.modals);
  const deltaVersion = delta ?? '';
  const environmentName = infraEnv ?? '';

  const userPlatform = parseUserAgent(navigator.userAgent);
  const browser = `${userPlatform.browser?.name ?? ''} ${userPlatform.browser?.version ?? ''}`;
  const operatingSystem = `${userPlatform.os?.name ?? ''} ${userPlatform.os?.version ?? ''}`;
  const environment = {
    deltaVersion,
    operatingSystem,
    browser,
    environmentName,
    fusionVersion: FUSION_VERSION,
  };
  const open = modals.isAboutModelVisible;
  const onCancel = () => dispatch(updateAboutModalVisibility(false));
  return (
    <Modal
      centered
      closable
      destroyOnClose
      maskClosable
      className="app-information-modal"
      maskStyle={{ background: '#002766' }}
      footer={null}
      {...{ open, onCancel }}
    >
      <div className="description">
        <h3>Information</h3>
        <p>Nexus is Open Source and available under the Apache 2 license</p>
      </div>
      <Divider />
      <div className="copyright">
        <span>© 2017–{new Date().getFullYear()}</span>
        <img src={bbpLogo} alt="epfl/bbp" />
      </div>
      <Divider />
      <div className="versions">
        <div className="nexus-service-header">
          <Subtitle className="nexus-services">Nexus Services</Subtitle>
          <span style={{ color: '#A1A1A1' }}>Deployment: {environmentName}</span>
          <Copy
            render={(copySuccess, triggerCopy) => (
              <Tooltip title={copySuccess ? 'Copied!' : 'Copy Environment Information'}>
                <Button
                  aria-label="copy-environment-information"
                  onClick={() => triggerCopy(envInfoForClipboard(environment))}
                  type="text"
                  icon={<CopyIcon />}
                  size="small"
                  className="copy-icon"
                />
              </Tooltip>
            )}
          />
        </div>
        <div className="versions-items">
          <div className="version-item" data-testid="delta-version">
            <div>Nexus Delta</div>
            <p>{deltaVersion}</p>
          </div>
          <a
            className="version-item"
            data-testid="fusion-version"
            href={`${repoUrl}/commits/${COMMIT_HASH}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div>Nexus Fusion</div>
            <p>{FUSION_VERSION}</p>
          </a>
        </div>
      </div>
      <Divider />
      <div className="repository">
        <div className="gh-link">
          <GithubOutlined />
          <a href={githubIssueURL} rel="noopener noreferrer" target="_blank">
            Report Issue
          </a>
        </div>
        <div className="gh-link">
          <GithubOutlined />
          <a href={releaseNoteUrl} rel="noopener noreferrer" target="_blank">
            Fusion Release Notes
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default AppInfo;
