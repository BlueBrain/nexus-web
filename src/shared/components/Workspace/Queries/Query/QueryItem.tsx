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
}

const QueryListItem: React.FunctionComponent<QueryListItemProps> = props => {
  const { predicate, resource, onClick = () => {} } = props;
  const imagePreviewProps = useNexusImage(resource);
  return (
    <ListItem
      popover={{
        content: <ResourceMetadataCard {...{ resource }} />,
        mouseEnterDelay: MOUSE_ENTER_DELAY,
        key: resource.id,
      }}
      preview={imagePreviewProps}
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
