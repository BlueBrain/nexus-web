import * as React from 'react';
import { Resource, NexusFile } from '@bbp/nexus-sdk';
import ListItem from '../../../Animations/ListItem';
import ResourceMetadataCard from '../../../Resources/MetadataCard';
import TypesIconList from '../../../Types/TypesIcon';
import useNexusImage from '../../../hooks/useNexusImage';

const MOUSE_ENTER_DELAY = 0.5;

export interface QueryListItemProps {
  resource: Resource;
  predicate?: React.ReactNode;
  onClick?(resource: Resource): void;
  onEdit?(): void;
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
}

const QueryListItem: React.FunctionComponent<QueryListItemProps> = props => {
  const { predicate, resource, getFilePreview, onClick = () => {} } = props;
  const { image } = useNexusImage(resource);
  return (
    <ListItem
      popover={{
        content: <ResourceMetadataCard {...{ resource, getFilePreview }} />,
        mouseEnterDelay: MOUSE_ENTER_DELAY,
        key: resource.id,
      }}
      avatar={image}
      onClick={() => onClick(resource)}
      label={
        predicate ? (
          <>
            <span className="predicate">{predicate}</span> {resource.name}
          </>
        ) : (
          resource.name
        )
      }
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
