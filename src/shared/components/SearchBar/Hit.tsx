import * as React from 'react';
import { Spin, Tooltip } from 'antd';
import {
  DatabaseOutlined,
  EnterOutlined,
  LockOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { AccessControl } from '@bbp/react-nexus';

import './Hit.less';

export const globalSearchOption = (value: string | undefined) => {
  return (
    <div className="hit">
      <div className="hit__icon">
        <SearchOutlined />
      </div>
      <div className="hit__body">
        <span>{value}</span>
      </div>
      <div className="hit__action">
        <span className="enter">
          <EnterOutlined style={{ transform: 'scaleX(-1)' }} /> Search Nexus{' '}
        </span>
      </div>
    </div>
  );
};

const Hit: React.FC<{
  orgLabel?: string;
  projectLabel?: string;
}> = ({ children, orgLabel, projectLabel }) => {
  return (
    <div className="hit">
      <div className="hit__icon">
        <DatabaseOutlined />
      </div>
      <div className="hit__body">{children}</div>
      <div className="hit__action">
        <span>
          <EnterOutlined style={{ transform: 'scaleX(-1)' }} /> Jump to Project{' '}
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
      </div>
    </div>
  );
};

export default Hit;
