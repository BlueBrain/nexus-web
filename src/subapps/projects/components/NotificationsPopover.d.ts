import * as React from 'react';
import './NotificationsPopover.less';
declare const NotififcationsPopover: React.FC<{
  activities: {
    name?: string;
    resourceId: string;
    createdAt: string;
    createdBy: string;
    usedList?: string[];
    generatedList?: string[];
    resourceType?: string | string[];
  }[];
  onClickLinkActivity: (id: string) => void;
  onClickNew: (id: string) => void;
}>;
export default NotififcationsPopover;
