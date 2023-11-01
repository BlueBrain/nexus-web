import * as React from 'react';
import { Timeline, Card, TimelineItemProps } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import moment from 'moment';

import './History.scss';
import FriendlyTimeAgo from '../FriendlyDate';

const HistoryComponent: React.FunctionComponent<{
  revisions: {
    changes: object;
    hasChanges: boolean;
    userName: string;
    updatedAt: string;
    createdAt: string;
  }[];
  link?: (rev: number) => React.ReactNode;
}> = ({ revisions, link }) => {
  const items: TimelineItemProps[] = revisions.map((revision, index) => {
    if (index === 0) {
      return {
        key: index,
        className: 'created-at',
        dot: <StarOutlined />,
        children: (
          <div>
            {' '}
            {link && link(index + 1)} created by <b>{revision.userName}</b>{' '}
            <FriendlyTimeAgo date={moment(revision.createdAt)} />
          </div>
        ),
      } as TimelineItemProps;
    }

    return {
      key: index,
      color: revision.hasChanges ? 'blue' : 'red',
      children: (
        <div>
          {' '}
          {link && link(index + 1)} updated by <b>{revision.userName}</b>{' '}
          <FriendlyTimeAgo date={moment(revision.updatedAt)} />
          <div className="changes" style={{ width: '100%', marginTop: '1em' }}>
            {revision.hasChanges ? (
              <Card>
                {JSON.stringify(
                  revision.changes,
                  (_, value) => {
                    return typeof value === 'undefined' ? null : value;
                  },
                  2
                )}
              </Card>
            ) : (
              'No changes'
            )}
          </div>
        </div>
      ),
    };
  });
  return <Timeline style={{ padding: '1em' }} items={items} />;
};

export default HistoryComponent;
