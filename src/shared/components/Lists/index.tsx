import * as React from 'react';
import './Lists.less';
import { List } from '../../store/reducers/lists';
import ListItem from './ListItem';
import { Empty } from 'antd';
import { Project, NexusFile } from '@bbp/nexus-sdk';

interface ListProps {
  lists: List[];
  project: Project;
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
  initialize: () => void;
}

const Lists: React.FunctionComponent<ListProps> = ({
  lists,
  initialize,
  project,
  getFilePreview,
}) => {
  console.log('receiving', lists);
  const { label: projectLabel, orgLabel } = project;
  const orgProjectFilterKey = orgLabel + projectLabel;
  const projectLists: List[] = lists;

  React.useEffect(() => {
    if (projectLists.length === 0) {
      initialize();
    }
  });

  if (!project) {
    return null;
  }

  return (
    <ul className="list-board">
      {(projectLists || []).map((list, listIndex: number) => {
        return (
          <li
            className="list"
            key={list.id}
            style={{ opacity: 1, width: '300px' }}
          >
            <ListItem
              getFilePreview={getFilePreview}
              list={list}
              listIndex={listIndex}
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              orgProjectFilterKey={orgProjectFilterKey}
            />
          </li>
        );
      })}
      {!(projectLists || []).length && (
        <div style={{ opacity: 1, width: '50%', marginTop: '5%' }}>
          <Empty description="No Queries" />
        </div>
      )}
    </ul>
  );
};

export default Lists;
