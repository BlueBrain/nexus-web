import * as React from 'react';

import './Item.scss';

type ListItemProps = {
  onClick?: () => void;
  actions?: React.ReactElement | React.ReactElement[];
  children?: React.ReactNode;
};

const Item: React.FunctionComponent<ListItemProps> = props => {
  return (
    <li className="ListItem" onClick={props.onClick}>
      <div className="body">{props.children}</div>
      <div className="actions">{props.actions}</div>
    </li>
  );
};

export default Item;
