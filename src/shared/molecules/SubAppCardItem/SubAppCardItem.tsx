import React, { Fragment, CSSProperties, useState } from 'react'
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { Modal } from 'antd';

import './styles.less';


type Props = {
    id: string;
    containerStyle?: CSSProperties;
    titleStyle?: CSSProperties;
    subtitleStyle?: CSSProperties;
    title: string;
    subtitle: string;
    tileColor: string;
    to: string;
    createLabel?: string;
}
type TCreationModal = {
    visible: boolean;
    updateVisibility(value?: boolean): void;
}
const CreateOrganisation: React.FC<TCreationModal> = ({ visible, updateVisibility }) => {
    console.log('@@CreateOrganisation')
    return <Modal
        visible={visible}
    />
}
const CreateProject: React.FC<TCreationModal> = ({ visible, updateVisibility }) => {
    console.log('@@CreateProject')
    return <Modal
        visible={visible}
    />
}
const CreateStudio: React.FC<TCreationModal> = ({ visible, updateVisibility }) => {
    console.log('@@CreateStudio')
    return <Modal
        visible={visible}
    />
}


export default function SubAppCardItem({
    to, id,
    title, subtitle,
    tileColor, createLabel,
    containerStyle, titleStyle, subtitleStyle,
}: Props) {
    const [modalVisible, setModalVisible] = useState<boolean>(() => false);
    const updateVisibility = (value?: boolean) => {
        console.log('@@updateVisibility', value);
        setModalVisible((state) => value ?? !state);
    }
    console.log('@@updateVisibility-2', id, modalVisible);
    return (
        <Fragment>
            <div className='subapp-card-item'>
                <Link to={to} className='subapp-link'>
                    <div className='subapp-link-container' style={containerStyle}>
                        <div className='subapp-link-container-title' style={titleStyle}>{title}</div>
                        <div className='subapp-link-container-subtitle' style={subtitleStyle}>{subtitle}</div>
                    </div>
                    <div className='subapp-link-tile' style={{ background: tileColor }} />
                </Link>
                <button
                    className='subapp-create-btn'
                    onClick={() => updateVisibility(true)}
                    // @ts-ignore
                    style={{ '--bg-color': tileColor }}
                >
                    <span>{createLabel}</span>
                    <PlusOutlined />
                </button>
            </div>
            {id === 'applist/organisations' && <CreateOrganisation visible={modalVisible} updateVisibility={updateVisibility} />}
            {id === 'applist/projects' && <CreateProject visible={modalVisible} updateVisibility={updateVisibility} />}
            {id === 'applist/studios' && <CreateStudio visible={modalVisible} updateVisibility={updateVisibility} />}
        </Fragment>
    )
}