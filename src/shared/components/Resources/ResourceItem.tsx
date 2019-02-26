import * as React from 'react';
import { Popover } from 'antd';
import TypesIcon from '../Types/TypesIcon';

import './Resources.less';
import ResourceMetadataCard from './MetadataCard';
import { Resource } from '@bbp/nexus-sdk';
import ResourcePreview from './ResourcePreview';

const MOUSE_ENTER_DELAY = 0.5;

export interface ResourceItemProps {
  resource: Resource;
  index: number;
  onClick?(): void;
  onEdit?(): void;
}

const ResourceListItem: React.FunctionComponent<ResourceItemProps> = props => {
  const { resource, index, onClick = () => {} } = props;
  const containerRef = React.createRef<HTMLDivElement>();

  let Preview = null;
  if (
    resource.type &&
    resource.type.includes('File') &&
    (resource.data as any)['_mediaType'] &&
    (resource.data as any)['_mediaType'].includes('image') &&
    // Don't download preview if filesize is > than 1MB
    (resource.data as any)['_bytes'] <= 1000000
  ) {
    Preview = <ResourcePreview resource={resource} />;
  }

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
        {Preview}
        <div className="name">
          <em>{resource.name}</em>
        </div>
        {resource.type && resource.type.length && (
          <TypesIcon type={resource.type} />
        )}
      </div>
    </Popover>
  );
};

export default ResourceListItem;
