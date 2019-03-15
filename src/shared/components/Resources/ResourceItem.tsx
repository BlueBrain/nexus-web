import * as React from 'react';
import { Popover } from 'antd';
import TypesIcon from '../Types/TypesIcon';

import './resource-item.less';
import ResourceMetadataCard from './MetadataCard';
import { Resource, NexusFile } from '@bbp/nexus-sdk';
import ResourcePreview, { hasDisplayableImage } from './ResourcePreview';

const MOUSE_ENTER_DELAY = 0.5;

export interface ResourceItemProps {
  resource: Resource;
  index: number;
  onClick?(): void;
  onEdit?(): void;
  predicate?: string;
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
}

const ResourceListItem: React.FunctionComponent<ResourceItemProps> = props => {
  const {
    resource,
    getFilePreview,
    predicate,
    index,
    onClick = () => {},
  } = props;
  const containerRef = React.createRef<HTMLDivElement>();

  const Preview = hasDisplayableImage(resource) ? (
    <ResourcePreview resource={resource} getFilePreview={getFilePreview} />
  ) : null;

  const handleKeyPress = (e: any) => {
    const code = e.keyCode || e.which;
    // enter is pressed
    if (code === 13 && containerRef.current && document) {
      onClick();
    }
  };

  return (
    <Popover
      content={
        <ResourceMetadataCard {...{ ...resource, name: resource.name }} />
      }
      mouseEnterDelay={MOUSE_ENTER_DELAY}
    >
      <div
        ref={containerRef}
        className="clickable-container resource-item"
        onClick={onClick}
        onKeyPress={handleKeyPress}
        tabIndex={index + 1}
      >
        {predicate && <div className="predicate">{predicate}</div>}
        <div className="label">
          {Preview}
          <div className="name">
            <em>{resource.name}</em>
          </div>
          {resource.type && resource.type.length && (
            <TypesIcon type={resource.type} />
          )}
        </div>
      </div>
    </Popover>
  );
};

export default ResourceListItem;
