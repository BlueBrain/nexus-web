import React, { CSSProperties } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import './styles.less';
import { AccessControl } from '@bbp/react-nexus';

type TProps = {
  title: string;
  extra: string | React.ReactNode;
  bg: string;
  alt: string;
  imgCss?: CSSProperties;
  createLabel?: string;
  onCreateClick?(): void;
  permissions?: string[];
  path?: string[];
};

const RouteHeader = ({
  title,
  extra,
  bg,
  alt,
  imgCss,
  createLabel,
  onCreateClick,
  permissions = [],
  path = ['/'],
}: TProps) => {
  return (
    <div className="route-header">
      <img src={bg} alt={alt} style={{ ...imgCss }} />
      <div className="title">
        <h2>{title}</h2>
        <p>{extra}</p>
      </div>
      {createLabel && (
        <div className="action">
          <button className="create-btn" onClick={onCreateClick}>
            {createLabel}
            <PlusOutlined />
          </button>
        </div>
      )}
      {/* <AccessControl
        {...{ permissions, path }}
        noAccessComponent={() => <></>}
      >
      </AccessControl> */}
    </div>
  );
};

export default RouteHeader;
