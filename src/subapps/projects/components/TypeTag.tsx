import * as React from 'react';

import './TypeTag.less';

const TypeTag: React.FC<{ type: string }> = ({ type }) => {
  if (type === 'FusionNote') {
    return <span className="type-tag type-tag--purple">notes</span>;
  }

  if (type === 'FusionCode') {
    return <span className="type-tag type-tag--green">code</span>;
  }

  return null;
};

export default TypeTag;
