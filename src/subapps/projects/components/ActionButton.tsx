import * as React from 'react';

import './ActionButton.less';

const addIcon = require('../../../shared/images/addIcon.svg');

const ActionButton: React.FC<{
  title?: string;
  onClick(): void;
  type: 'add' | string;
}> = ({ type, title, onClick }) => {
  let icon;

  switch (type) {
    case 'add':
      icon = addIcon;
      break;
    default:
      icon = addIcon;
  }

  return (
    <button className="action-button" onClick={onClick}>
      <img className="action-button__icon" src={icon} />
      <span>{title}</span>
    </button>
  );
};

export default ActionButton;
