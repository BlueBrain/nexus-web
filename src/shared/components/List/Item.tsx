import * as React from 'react';

import './Item.less';

const Item: React.FunctionComponent<{
  onClick?: () => void;
  actions?: React.ReactComponentElement<any>[];
}> = props => {
  const [hovered, setHovered] = React.useState<boolean>(false);
  return (
    <div
      className="ListItem"
      onClick={props.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {props.children} {hovered && props.actions}
    </div>
  );
};

export default Item;
