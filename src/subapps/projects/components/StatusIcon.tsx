import * as React from 'react';

const progressIcon = require('../../../shared/images/progressIcon.svg');
const blockedIcon = require('../../../shared/images/blockedStatus.svg');
const todoIcon = require('../../../shared/images/todoStatus.svg');
const doneIcon = require('../../../shared/images/done.svg');
const progressIconMini = require('../../../shared/images/progressIconMini.svg');
const blockedIconMini = require('../../../shared/images/blockedIconMini.svg');
const doneIconMini = require('../../../shared/images/doneIconMini.svg');

export enum Status {
  inProgress = 'inProgress',
  blocked = 'blocked',
  toDo = 'toDo',
  done = 'done',
}

const StatusIcon: React.FC<{
  status: Status;
  mini?: boolean;
}> = ({ status, mini }) => {
  let icon;

  switch (status) {
    case Status.inProgress:
      icon = mini ? progressIconMini : progressIcon;
      break;
    case Status.blocked:
      icon = mini ? blockedIconMini : blockedIcon;
      break;
    case Status.toDo:
      icon = todoIcon;
      break;
    case Status.done:
      icon = mini ? doneIconMini : doneIcon;
      break;
    default:
      icon = todoIcon;
  }

  return <img src={icon} />;
};

export default StatusIcon;
