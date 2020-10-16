import * as React from 'react';
import { isEqual } from 'lodash';

import fusionConfig from '../config';

import './TypeTag.less';

const TypeTag: React.FC<{ type: string | string[] }> = ({ type }) => {
  if (
    Array.isArray(type) &&
    isEqual(type.sort(), fusionConfig.codeType.sort())
  ) {
    return <span className="type-tag type-tag--green">code</span>;
  }

  if (type === fusionConfig.noteType) {
    return <span className="type-tag type-tag--purple">notes</span>;
  }

  return null;
};

export default TypeTag;
