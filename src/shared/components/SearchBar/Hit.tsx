import * as React from 'react';
import { EnterOutlined, FileOutlined, SearchOutlined } from '@ant-design/icons';
import { match } from 'ts-pattern';
import { SearchQuickActions } from '.';

import './Hit.less';

export enum HitType {
  UNCERTAIN = 'UNCERTAIN',
  RESOURCE = 'RESOURCE',
}

const Hit: React.FC<{ type: HitType }> = ({ type, children }) => {
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
    .run();

  return (
    <div className="hit">
      <div className="icon">{icon}</div>
      <div className="body">{children}</div>
      <div className="action">{actionTip}</div>
    </div>
  );
};

export default Hit;
