import * as React from 'react';

import './Item.less';

const Item: React.FunctionComponent<{
  onClick?: () => void;
  actions?: React.ReactComponentElement<any>[];
}> = props => {
  return (
    <li className="ListItem" onClick={props.onClick}>
      <div className="body">{props.children}</div>
      {<div className="actions">{props.actions}</div>}
    </li>
  );
};

export default Item;
