import * as React from 'react';

import fusionConfig from '../config';

import './TypeTag.less';

const TypeTag: React.FC<{ type: string }> = ({ type }) => {
  if (type === fusionConfig.noteType) {
    return <span className="type-tag type-tag--purple">notes</span>;
  }

  if (type === fusionConfig.codeSnippetType) {
    return <span className="type-tag type-tag--green">code</span>;
  }

  return null;
};

export default TypeTag;
