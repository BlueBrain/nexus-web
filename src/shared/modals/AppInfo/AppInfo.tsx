import React from 'react'
import { Divider, Modal } from 'antd';
import { ConsentType } from '../../layouts/FusionMainLayout';
import { GithubOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './styles.less';


declare var Version: string;
type Props = {
    version: string;
    githubIssueURL: string;
    commitHash?: string;
    consent?: ConsentType;
    visible: boolean;
    onModalStateChange(): void;
    onClickRemoveConsent?(): void;
}
const releaseNoteUrl = 'https://github.com/BlueBrain/nexus-web/releases';


const AppInfo = ({
    version, githubIssueURL, commitHash, consent,
    visible, onModalStateChange, onClickRemoveConsent,
}: Props) => {
    return (
        <Modal
            visible={visible}
            onCancel={onModalStateChange}
            centered
            closable
            destroyOnClose
            maskClosable
            className='app-information-modal'
            footer={null}
            maskStyle={{ background: '#002766' }}
        >
            <div className='description'>
                <h3>Information</h3>
                <p>Nexus is Open Source and available under the Apache 2 license</p>
            </div>
            <Divider/>
            <div className='copyright'>
                <span>© 2017–{new Date().getFullYear()}</span>
                <img src={require('../../images/EPFL_BBP_logo.png')} alt="epfl/bbp" />
            </div>
            <Divider/>
            <div className='versions'>
                <div className='versions-title'>Nexus Services</div>
                <div className='versions-items'>
                    <div className='version-item'>
                        <div>Nexus Delta</div>
                        <p>{version}</p>
                    </div>
                    <div className='version-item'>
                        <div>Nexus Fusion</div>
                        <p>{Version}</p>
                    </div>
                </div>
            </div>
            <Divider/>
            <div className='repository'>
                <div className='gh-link'>
                    <GithubOutlined />
                    <a href={githubIssueURL} rel="noopener noreferrer" target="_blank">Report Issue</a>
                </div>
                <div className='gh-link'>
                    <GithubOutlined />
                    <a href={releaseNoteUrl} rel="noopener noreferrer" target="_blank">Fusion Release Notes</a>
                </div>
            </div>
        </Modal>
    )
}


export default AppInfo;