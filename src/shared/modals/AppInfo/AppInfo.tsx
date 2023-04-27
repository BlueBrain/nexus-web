import * as React from 'react';
import { Button, Divider, Modal, Tag, Tooltip } from 'antd';
import { parseUserAgent } from 'react-device-detect';
import { useNexus } from '@bbp/react-nexus';
import { NexusClient } from '@bbp/nexus-sdk';
import { useSelector, useDispatch } from 'react-redux';
import { GithubOutlined } from '@ant-design/icons';
import { Subtitle } from '../../../shared/styled_components/typography/Subtitle/Subtitle';
import { CopyIcon } from '../../../shared/components/Icons/CopyIcon';
import { RootState } from '../../../shared/store/reducers';
import { updateAboutModalVisibility } from '../../../shared/store/actions/modals';
import { url as githubIssueURL } from '../../../../package.json';
import Copy from '../../../shared/components/Copy';

import './styles.less';

declare var FUSION_VERSION: string;
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

const AppInfo: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const { config, modals } = useSelector((state: RootState) => ({
    config: state.config,
    modals: state.modals,
  }));

  const versions: any = useNexus<any>((nexus: NexusClient) =>
    nexus.httpGet({
      path: `${config.apiEndpoint}/version`,
      context: { as: 'json' },
    })
  );
  const deltaVersion = React.useMemo(() => {
    if (versions.data) {
      return versions.data.delta as string;
    }
    return '';
  }, [versions]);

  const environmentName = React.useMemo(() => {
    if (versions.data) {
      return versions.data.environment as string;
    }
    return '';
  }, [versions]);
  const userPlatform = parseUserAgent(navigator.userAgent);
  const browser = `${userPlatform.browser?.name ?? ''} ${userPlatform.browser
    ?.version ?? ''}`;
  const operatingSystem = `${userPlatform.os?.name ?? ''} ${userPlatform.os
    ?.version ?? ''}`;
  const environment = {
    deltaVersion,
    operatingSystem,
    browser,
    environmentName,
    fusionVersion: FUSION_VERSION,
  };
  const open = modals.aboutModel;
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
        <img src={require('../../images/EPFL_BBP_logo.png')} alt="epfl/bbp" />
      </div>
      <Divider />
      <div className="versions">
        <div className="nexus-service-header">
          <Subtitle className="nexus-services">Nexus Services</Subtitle>
          <Tag color="blue" className="tag" data-testid="environment-name">
            {environmentName}
          </Tag>
          <Copy
            render={(copySuccess, triggerCopy) => (
              <Tooltip
                title={copySuccess ? 'Copied!' : 'Copy Environment Information'}
              >
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
          <div className="version-item" data-testid="fusion-version">
            <div>Nexus Fusion</div>
            <p>{FUSION_VERSION}</p>
          </div>
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
