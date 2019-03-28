import * as React from 'react';
import './list-item.less';

export interface ListItemProps {
  label: string;
  key: string;
  description?: string;
  detail?: React.ReactComponentElement<any>;
  action?: React.ReactComponentElement<any>;
  onClick?(): void;
}

const ListItem: React.FunctionComponent<ListItemProps> = ({
  label,
  key,
  description = '',
  onClick = () => {},
  detail,
  action,
}) => {
  return (
    <div
      className="list-card -compact"
      tabIndex={1}
      onClick={onClick}
      key={key}
    >
      <div className="content">
        <span className="label">{label}</span>
        {detail && <div className="detail">{detail}</div>}
        {action && <div className="actions">{action}</div>}
      </div>
      <div className="fade" />
      {description && <p className="description">{description}</p>}
    </div>
  );
};

export default ListItem;
