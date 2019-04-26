import * as React from 'react';
import './list-item.less';

export interface ListItemProps {
  label: React.ReactComponentElement<any> | string;
  id: string;
  description?: string;
  details?: React.ReactComponentElement<any> | null;
  action?: React.ReactComponentElement<any> | null;
  onClick?: (id: string, event: React.MouseEvent) => void;
}

const ListItem: React.FunctionComponent<ListItemProps> = ({
  label,
  id,
  description = '',
  onClick,
  details,
  action,
}) => {
  return (
    <li
      className="list-item -compact"
      tabIndex={1}
      onClick={
        onClick
          ? (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => onClick(id, e)
          : undefined
      }
      key={id}
    >
      <div className="content">
        <span className="label">{label}</span>
        {details && <div className="details">{details}</div>}
        {action && <div className="actions">{action}</div>}
      </div>
      {description && <p className="description">{description}</p>}
    </li>
  );
};

export default ListItem;
