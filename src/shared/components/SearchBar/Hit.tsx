import * as React from 'react';
import { Spin, Tooltip } from 'antd';
import {
  DatabaseOutlined,
  EnterOutlined,
  FileOutlined,
  SearchOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { match } from 'ts-pattern';
import { AccessControl } from '@bbp/react-nexus';

import { SearchQuickActions } from '.';

import './Hit.less';

export enum HitType {
  UNCERTAIN = 'UNCERTAIN',
  RESOURCE = 'RESOURCE',
  PROJECT = 'PROJECT',
}

const Hit: React.FC<{
  type: HitType;
  orgLabel?: string;
  projectLabel?: string;
}> = ({ type, children, orgLabel, projectLabel }) => {
  const { icon, actionTip } = match<
    HitType,
    { icon: JSX.Element; actionTip: JSX.Element }
  >(type)
    .with(HitType.RESOURCE, () => ({
      icon: <FileOutlined />,
      actionTip: (
        <span className="enter">
          {SearchQuickActions.VISIT} <EnterOutlined />
        </span>
      ),
    }))
    .with(HitType.UNCERTAIN, () => ({
      icon: <SearchOutlined />,
      actionTip: (
        <span className="enter">
          search <EnterOutlined />
        </span>
      ),
    }))
    .with(HitType.PROJECT, () => ({
      icon: <DatabaseOutlined />,
      actionTip: (
        <span className="enter">
          <EnterOutlined style={{ transform: 'scaleX(-1)' }} /> jump to project{' '}
          {orgLabel && projectLabel && (
            <AccessControl
              permissions={['resources/read']}
              path={`/${orgLabel}/${projectLabel}`}
              noAccessComponent={() => (
                <Tooltip title="No read access to data in this project">
                  <LockOutlined />
                </Tooltip>
              )}
              loadingComponent={<Spin spinning={true} size="small" />}
            >
              <span />
            </AccessControl>
          )}
        </span>
      ),
    }))
    .run();

  return (
    <div className="hit">
      <div className="hit__icon">{icon}</div>
      <div className="hit__body">{children}</div>
      <div className="hit__action">{actionTip}</div>
    </div>
  );
};

export default Hit;
