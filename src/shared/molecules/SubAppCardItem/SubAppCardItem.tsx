import React, { Fragment, CSSProperties, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import CreateOrganization from '../../modals/CreateOrganization/CreateOrganization';
import CreateProject from '../../modals/CreateProject/CreateProject';
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
};

export default function SubAppCardItem({
  to,
  id,
  title,
  subtitle,
  tileColor,
  createLabel,
  containerStyle,
  titleStyle,
  subtitleStyle,
}: Props) {
  const [modalVisible, setModalVisible] = useState<boolean>(() => false);
  const updateVisibility = (value?: boolean) => {
    setModalVisible(state => value ?? !state);
  };
  return (
    <Fragment>
      <div className="subapp-card-item">
        <Link to={to} className="subapp-link">
          <div className="subapp-link-container" style={containerStyle}>
            <div className="subapp-link-container-title" style={titleStyle}>
              {title}
            </div>
            <div
              className="subapp-link-container-subtitle"
              style={subtitleStyle}
            >
              {subtitle}
            </div>
          </div>
          <div className="subapp-link-tile" style={{ background: tileColor }} />
        </Link>
        {createLabel && (
          <button
            className="subapp-create-btn"
            onClick={() => updateVisibility(true)}
            // @ts-ignore
            style={{ '--bg-color': tileColor }}
          >
            <span>{createLabel}</span>
            <PlusOutlined />
          </button>
        )}
      </div>
      {id === 'applist/organisations' && (
        <CreateOrganization
          visible={modalVisible}
          updateVisibility={updateVisibility}
        />
      )}
      {id === 'applist/projects' && (
        <CreateProject
          visible={modalVisible}
          updateVisibility={updateVisibility}
        />
      )}
    </Fragment>
  );
}
