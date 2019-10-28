import * as React from 'react';
import { Icon, Timeline, Card, Button } from 'antd';
import * as moment from 'moment';

import './History.less';

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
  return (
    <Timeline style={{ padding: '1em' }}>
      {revisions.map((revision, index) => {
        if (index === 0) {
          return (
            <Timeline.Item
              key={index}
              className="created-at"
              dot={<Icon type="star" />}
            >
              <div>
                {' '}
                {link && link(index + 1)} created by <b>{revision.userName}</b>{' '}
                on {moment(revision.createdAt).format('DD/MM/YYYY')}
              </div>
            </Timeline.Item>
          );
        }
        return (
          <Timeline.Item
            key={index}
            color={revision.hasChanges ? 'blue' : 'red'}
          >
            <div>
              {' '}
              {link && link(index + 1)} updated by <b>{revision.userName}</b> on{' '}
              {moment(revision.updatedAt).format('DD/MM/YYYY')}
              <div
                className="changes"
                style={{ width: 'max-content', marginTop: '1em' }}
              >
                {revision.hasChanges ? (
                  <Card>{JSON.stringify(revision.changes, null, 2)}</Card>
                ) : (
                  'No meaningful changes'
                )}
              </div>
            </div>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

export default HistoryComponent;
