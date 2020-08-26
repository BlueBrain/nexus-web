import * as React from 'react';

const progressIcon = require('../../../shared/images/progressIcon.svg');
const blockedIcon = require('../../../shared/images/blockedStatus.svg');
const todoIcon = require('../../../shared/images/todoStatus.svg');
const doneIcon = require('../../../shared/images/done.svg');

const StatusIcon: React.FC<{
  status: string;
}> = ({ status }) => {
  let icon;

  switch (status) {
    case 'In progress':
      icon = progressIcon;
      break;
    case 'Blocked':
      icon = blockedIcon;
      break;
    case 'To do':
      icon = todoIcon;
      break;
    case 'Done':
      icon = doneIcon;
      break;
    default:
      icon = todoIcon;
  }

  return <img src={icon} />;
};

export default StatusIcon;
