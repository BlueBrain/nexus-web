import * as React from 'react';
import { Popover } from 'antd';
import { Resource, NexusFile } from '@bbp/nexus-sdk';
import ListItem from '../../../Animations/ListItem';
import ResourceMetadataCard from '../../../Resources/MetadataCard';
import TypesIconList from '../../../Types/TypesIcon';
import { hasDisplayableImage } from '../../../Resources/ResourcePreview';
import useNexusFile from '../../../hooks/useNexusFile';

const MOUSE_ENTER_DELAY = 0.5;

export interface QueryListItemProps {
  resource: Resource;
  onClick?(resource: Resource): void;
  onEdit?(): void;
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
}

const QueryListItem: React.FunctionComponent<QueryListItemProps> = props => {
  const { resource, getFilePreview, onClick = () => {} } = props;
  const file = useNexusFile(resource, hasDisplayableImage, getFilePreview);
  let avatar = null;
  if (file) {
    const img = new Image();
    img.src = `data:${file.mediaType};base64,${file.rawFile as string}`;
    avatar = file && {
      src: img.src,
    };
  }
  return (
    <ListItem
      popover={{
        content: (
          <ResourceMetadataCard {...{ ...resource, name: resource.name }} />
        ),
        mouseEnterDelay: MOUSE_ENTER_DELAY,
        key: resource.id,
      }}
      avatar={avatar}
      onClick={() => onClick(resource)}
      label={resource.name}
      id={resource.id}
      details={
        resource.type && !!resource.type.length ? (
          <TypesIconList type={resource.type} />
        ) : null
      }
    />
  );
};

export default QueryListItem;
