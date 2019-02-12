import * as React from 'react';
import TypesIcon from '../Types/TypesIcon';
import './Resources.less';
import { ResourceMetadataCardProps } from './MetaData';

export interface ResourceItemProps extends ResourceMetadataCardProps {
  id: string;
  type?: string[];
  index: number;
  onClick?(): void;
  onEdit?(): void;
}

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
    <div
      ref={containerRef}
      className="clickable-container resource-item"
      onClick={onClick}
      onKeyPress={handleKeyPress}
      tabIndex={index + 1}
    >
      <div className="name">{name}</div>
      {type && type.length && <TypesIcon type={type} />}
    </div>
  );
};

export default ResourceListItem;
