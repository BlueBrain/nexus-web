import * as React from 'react';
import './list-item.less';
import useMeasure from '../hooks/useMeasure';

export interface ListItemProps {
  label: React.ReactComponentElement<any> | string;
  id: string;
  description?: string;
  details?: React.ReactComponentElement<any> | null;
  avatar?: { src: string } | null;
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
  avatar,
}) => {
  const [bind, bounds] = useMeasure();
  return (
    <li
      className={`list-item -compact ${avatar ? '-big' : ''}`}
      tabIndex={1}
      onClick={
        onClick
          ? (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => onClick(id, e)
          : undefined
      }
      key={id}
    >
      {avatar && (
        // @ts-ignore can't bothered to figure out which HTMLELEMENT type I need for this
        <div {...bind} className={`avatar -big`}>
          <div
            className="wrapper"
            style={{ backgroundImage: `url(${avatar.src})` }}
          >
            <img src={avatar.src} />
          </div>
        </div>
      )}
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
