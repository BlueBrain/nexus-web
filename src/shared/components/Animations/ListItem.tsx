import * as React from 'react';
import './list-item.less';
import useMeasure from '../hooks/useMeasure';
import { Popover } from 'antd';
import { PopoverProps } from 'antd/lib/popover';

export interface ListItemProps {
  label: React.ReactComponentElement<any> | string;
  id: string;
  description?: string;
  details?: React.ReactComponentElement<any> | null;
  avatar?: { src: string } | null;
  action?: React.ReactComponentElement<any> | null;
  onClick?: (id: string, event: React.MouseEvent) => void;
  popover?: PopoverProps;
}

const ListItem: React.FunctionComponent<ListItemProps> = ({
  label,
  id,
  description = '',
  onClick,
  details,
  action,
  avatar,
  popover,
}) => {
  const ContentWrapper: React.FunctionComponent = popover
    ? ({ children }) => <Popover {...popover}>{children}</Popover>
    : ({ children }) => <div className="wrapper">{children}</div>;
  return (
    <ContentWrapper key={id}>
      <li
        className={`list-item -compact ${avatar ? '-big' : ''}`}
        tabIndex={1}
        onClick={
          onClick
            ? (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => onClick(id, e)
            : undefined
        }
      >
        {avatar && (
          <div className={`avatar -big`}>
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
    </ContentWrapper>
  );
};

export default ListItem;
