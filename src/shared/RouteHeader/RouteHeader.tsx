import './styles.scss';

import { PlusOutlined } from '@ant-design/icons';
import { AccessControl } from '@bbp/react-nexus';
import React, { CSSProperties } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../shared/store/reducers';

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
  supTitle?: string;
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
  supTitle,
}: TProps) => {
  const { layoutSettings } = useSelector((state: RootState) => state.config);
  return (
    <div
      className="route-header"
      style={{ background: layoutSettings.mainColor }}
    >
      <img src={bg} alt={alt} style={{ ...imgCss }} />
      <div className="title">
        {supTitle && <h4>{supTitle}</h4>}
        <h2>{title}</h2>
        <p>{extra}</p>
      </div>
      {createLabel && (
        <AccessControl
          {...{ permissions, path }}
          noAccessComponent={() => <></>}
        >
          <div className="action">
            <button className="create-btn" onClick={onCreateClick}>
              {createLabel}
              <PlusOutlined />
            </button>
          </div>
        </AccessControl>
      )}
    </div>
  );
};

export default RouteHeader;
