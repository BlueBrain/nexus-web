import React from 'react';
import { Button, Divider, Modal, Tag, Tooltip } from 'antd';
import { ConsentType } from '../../layouts/FusionMainLayout';
import { GithubOutlined } from '@ant-design/icons';
import './styles.less';
import { Subtitle } from '../../../shared/styled_components/typography/Subtitle/Subtitle';
import Copy from '../../../shared/components/Copy';
import { CopyIcon } from '../../../shared/components/Icons/CopyIcon';

export interface EnvironmentInfo {
  deltaVersion: string;
  fusionVersion: string;
  environmentName: string;

  operatingSystem: string;
  browser: string;
}

interface Props {
  githubIssueURL: string;
  commitHash?: string;
  consent?: ConsentType;
  visible: boolean;
  environment: EnvironmentInfo;
  onCloseModal(): void;
  onClickRemoveConsent?(): void;
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

const AppInfo = ({
  environment,
  githubIssueURL,
  visible,
  onCloseModal,
}: Props) => {
  return (
    <Modal
      open={visible}
      onCancel={onCloseModal}
      centered
      closable
      destroyOnClose
      maskClosable
      className="app-information-modal"
      footer={null}
      maskStyle={{ background: '#002766' }}
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
            {environment.environmentName}
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
            <p>{environment.deltaVersion}</p>
          </div>
          <div className="version-item" data-testid="fusion-version">
            <div>Nexus Fusion</div>
            <p>{environment.fusionVersion}</p>
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
