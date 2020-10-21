import * as React from 'react';
import { isEqual } from 'lodash';

import fusionConfig from '../config';

import './TypeTag.less';

const TypeTag: React.FC<{ type: string | string[] }> = ({ type }) => {
  if (Array.isArray(type)) {
    if (isEqual(type.sort(), fusionConfig.codeType.sort())) {
      return <span className="type-tag type-tag--green">code</span>;
    }

    if (isEqual(type.sort(), fusionConfig.noteType.sort())) {
      return <span className="type-tag type-tag--purple">notes</span>;
    }

    if (
      isEqual(type.sort(), fusionConfig.agentOrgType.sort()) ||
      isEqual(type.sort(), fusionConfig.agentPersonType.sort())
    ) {
      return <span className="type-tag type-tag--pink">agent</span>;
    }
  }

  return null;
};

export default TypeTag;
