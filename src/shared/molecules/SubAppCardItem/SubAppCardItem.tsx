import React, { Fragment, CSSProperties, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import CreateOrganization from '../../modals/CreateOrganization/CreateOrganization';
import CreateProject from '../../modals/CreateProject/CreateProject';
import './styles.less';

type TProps = {
  id: string;
  containerStyle?: CSSProperties;
  titleStyle?: CSSProperties;
  subtitleStyle?: CSSProperties;
  title: string;
  subtitle: string;
  tileColor: string;
  to: string;
  createLabel?: string;
  onCreateClick?(payload?: boolean): void;
};

const SubAppCardItem: React.FC<TProps> = ({
  to,
  id,
  title,
  subtitle,
  tileColor,
  createLabel,
  containerStyle,
  titleStyle,
  subtitleStyle,
  onCreateClick,
}) => {
  return (
    <Fragment>
      <div className="subapp-card-item">
        <Link to={to} className="subapp-link">
          <div className="subapp-link-container" style={containerStyle}>
            <div className="subapp-link-container-title" style={titleStyle}>
              {title}
            </div>
            <p
              className="subapp-link-container-subtitle"
              style={subtitleStyle}
            >
              {subtitle}
            </p>
          </div>
          <div className="subapp-link-tile" style={{ background: tileColor }} />
        </Link>
        {createLabel && (
          <button
            className="subapp-create-btn"
            onClick={() => onCreateClick?.(true)}
            // @ts-ignore
            style={{ '--bg-color': tileColor }}
          >
            <span>{createLabel}</span>
            <PlusOutlined />
          </button>
        )}
      </div>
    </Fragment>
  );
};
export default SubAppCardItem;
