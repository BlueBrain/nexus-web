import * as React from 'react';
import moment from 'moment';
declare const FriendlyTimeAgo: React.FC<{
  date: Date | moment.Moment;
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
}>;
export default FriendlyTimeAgo;
