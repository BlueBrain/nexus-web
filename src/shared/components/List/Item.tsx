import * as React from 'react';

import './Item.less';

const Item: React.FunctionComponent<{
  onClick?: () => void;
  actions?: React.ReactComponentElement<any>[];
}> = props => {
  const [hovered, setHovered] = React.useState<boolean>(false);
  return (
    <li
      className="ListItem"
      onClick={props.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="body">{props.children}</div>
      {hovered && <div className="actions">{props.actions}</div>}
    </li>
  );
};

export default Item;
