import { UpOutlined } from '@ant-design/icons';
import { Button, Card, Skeleton } from 'antd';
import * as React from 'react';

import TypesIcon from '../Types/TypesIcon';

const ResourceCardCollapsed: React.FunctionComponent<{
  onClickExpand?(): void;
  label: string;
  resourceUrl: string;
  busy: boolean;
  types?: string[];
  isExternal?: boolean;
}> = ({ onClickExpand, label, resourceUrl, busy, isExternal, types }) => {
  if (busy) {
    return (
      <Card
        bodyStyle={{
          padding: '0px 10px',
          width: '200px',
        }}
      >
        <Skeleton active paragraph={{ rows: 1 }} />
      </Card>
    );
  }

  return (
    <Card
      headStyle={{ fontSize: '12px' }}
      bodyStyle={{
        padding: '10px 7px 5px 7px',
        fontSize: '12px',
      }}
      title={<span>{label}&nbsp;</span>}
      size="small"
      extra={
        isExternal ? null : (
          <Button onClick={onClickExpand} shape="circle" icon={<UpOutlined />} size="small" />
        )
      }
      style={{ maxWidth: '400px' }}
    >
      {!!types && <div>{!!types && <TypesIcon type={types} full={true} />}</div>}
      {!!isExternal && (
        <a href={resourceUrl} target="_blank" rel="noreferrer">
          {resourceUrl}
        </a>
      )}
    </Card>
  );
};

export default ResourceCardCollapsed;
