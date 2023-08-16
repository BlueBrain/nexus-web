import * as React from 'react';

import './ActionButton.scss';

const addIcon = require('../../../shared/images/addIcon.svg');

const ActionButton: React.FC<{
  title?: string;
  onClick(): void;
  icon?: 'add' | string;
  highlighted?: boolean;
}> = ({ icon, title, onClick, highlighted }) => {
  let buttonIcon;

  switch (icon) {
    case 'add':
      buttonIcon = addIcon;
      break;
    default:
      buttonIcon = addIcon;
  }

  const onClickActionButton = (event: any) => {
    onClick();
    event.stopPropagation();
  };

  return (
    <button
      className={`action-button ${highlighted && 'action-button--highlighted'}`}
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
