import * as React from 'react';

import './ActionButton.less';

const addIcon = require('../../../shared/images/addIcon.svg');

const ActionButton: React.FC<{
  title?: string;
  onClick(): void;
  icon?: 'add' | string;
}> = ({ icon, title, onClick }) => {
  let buttonIcon;

  switch (icon) {
    case 'add':
      buttonIcon = addIcon;
      break;
    default:
      buttonIcon = addIcon;
  }

  const onClickActionButton = (event: any) => {
    event.stopPropagation();
    onClick();
  };

  return (
    <button
      className="action-button"
      onClick={onClickActionButton}
      type="button"
    >
      <div className="action-button__body">
        {icon && <img className="action-button__icon" src={buttonIcon} />}
        <span>{title}</span>
      </div>
    </button>
  );
};

export default ActionButton;
