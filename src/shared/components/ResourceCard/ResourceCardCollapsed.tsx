import * as React from 'react';
import { Card, Button, Skeleton } from 'antd';

import TypesIcon from '../Types/TypesIcon';

const ResourceCardCollapsed: React.FunctionComponent<{
  onClickExpand?(): void;
  label: string;
  busy: boolean;
  types?: string[];
  isExternal?: boolean;
}> = ({ onClickExpand, label, busy, isExternal, types }) => {
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
          <Button
            onClick={onClickExpand}
            shape="circle"
            icon="up"
            size="small"
          />
        )
      }
      style={{ maxWidth: '400px' }}
    >
      {!!types && (
        <div>{!!types && <TypesIcon type={types} full={true} />}</div>
      )}
      {!!isExternal && (
        <a href={label} target="_blank">
          {label}
        </a>
      )}
    </Card>
  );
};

export default ResourceCardCollapsed;
