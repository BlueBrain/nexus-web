import * as React from 'react';

import './ActionButton.less';

const addIcon = require('../../../shared/images/addIcon.svg');

const ActionButton: React.FC<{
  title?: string;
  onClick(): void;
  icon?: 'add' | string;
  bordered?: boolean;
}> = ({ icon, title, onClick, bordered }) => {
  let buttonIcon;

  switch (icon) {
    case 'add':
      buttonIcon = addIcon;
      break;
    default:
      buttonIcon = addIcon;
  }

  return (
    <button
      className={`action-button ${bordered ? 'action-button__bordered' : ''}`}
      onClick={onClick}
      type="button"
    >
      {icon && <img className="action-button__icon" src={buttonIcon} />}
      <span>{title}</span>
    </button>
  );
};

export default ActionButton;
