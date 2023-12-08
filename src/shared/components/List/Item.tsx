import './Item.scss';

import * as React from 'react';

const Item: React.FunctionComponent<{
  onClick?: () => void;
  actions?: React.ReactElement | React.ReactElement[];
}> = props => {
  return (
    <li className="ListItem" onClick={props.onClick}>
      <div className="body">{props.children}</div>
      <div className="actions">{props.actions}</div>
    </li>
  );
};

export default Item;
