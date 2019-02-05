import * as React from 'react';
import { Popover, Card } from 'antd';
import TypesIcon from '../Types/TypesIcon';

import './Resources.less';
import { Meta } from 'antd/lib/list/Item';
import moment = require('moment');

const MOUSE_ENTER_DELAY = 0.5;

export interface ResourceItemProps extends ResourceMetadataCardProps {
  id: string;
  type?: string[];
  index: number;
  onClick?(): void;
  onEdit?(): void;
}

export interface ResourceMetadataCardProps {
  name?: string;
  createdAt: string;
  updatedAt: string;
  constrainedBy: string;
}

export const ResourceMetadataCard: React.FunctionComponent<
  ResourceMetadataCardProps
> = props => {
  const { constrainedBy, name, createdAt, updatedAt } = props;
  return (
    <Card>
      <Meta
        title={
          <div
            className="name"
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <em style={{ fontSize: '1.2em' }}>{name}</em>
            <span>{moment(createdAt).format('DD/MM/YYYY')}</span>
          </div>
        }
        description={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>last updated {moment(updatedAt).fromNow()}</div>
            <div>
              schema: <b>{constrainedBy}</b>
            </div>
          </div>
        }
      />
    </Card>
  );
};

const ResourceListItem: React.FunctionComponent<ResourceItemProps> = props => {
  const { type, name, index, onClick = () => {} } = props;
  const containerRef = React.createRef<HTMLDivElement>();

  const handleKeyPress = (e: any) => {
    const code = e.keyCode || e.which;
    // enter is pressed
    if (code === 13 && containerRef.current && document) {
      onClick();
    }
  };

  return (
    <Popover
      content={<ResourceMetadataCard {...props} />}
      mouseEnterDelay={MOUSE_ENTER_DELAY}
    >
      <div
        ref={containerRef}
        className="clickable-container resource-item"
        onClick={onClick}
        onKeyPress={handleKeyPress}
        tabIndex={index + 1}
      >
        <div className="name">
          <em>{name}</em>
        </div>
        {type && type.length && <TypesIcon type={type} />}
      </div>
    </Popover>
  );
};

export default ResourceListItem;
