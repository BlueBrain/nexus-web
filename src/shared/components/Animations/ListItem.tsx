import * as React from 'react';
import './list-item.less';
import { Popover } from 'antd';
import { PopoverProps } from 'antd/lib/popover';
import { ImagePreviewProps, ImagePreviewComponent } from '../Images/Preview';

export interface ListItemProps {
  label: React.ReactComponentElement<any> | string;
  id: string;
  description?: string;
  details?: React.ReactComponentElement<any> | null;
  preview?: ImagePreviewProps;
  action?: React.ReactComponentElement<any> | null;
  onTitleClick?: (id: string, event: React.MouseEvent) => void;
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
  preview,
  popover,
  onTitleClick,
}) => {
  const ContentWrapper: React.FunctionComponent = popover
    ? ({ children }) => <Popover {...popover}>{children}</Popover>
    : ({ children }) => <div className="wrapper">{children}</div>;
  return (
    <ContentWrapper key={id}>
      <li
        className={`list-item -compact`}
        tabIndex={1}
        onClick={
          onClick
            ? (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => onClick(id, e)
            : undefined
        }
      >
        {preview && <ImagePreviewComponent {...preview} />}
        <div
          className="content"
          onClick={
            onTitleClick
              ? (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                  onTitleClick(id, e)
              : undefined
          }
        >
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
