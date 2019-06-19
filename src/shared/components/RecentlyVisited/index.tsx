import * as React from 'react';
import usePreviouslyVisited from '../hooks/usePreviouslyVisited';
import ListItem from '../Animations/ListItem';
import './recently-visited.less';
import { Icon } from 'antd';
import { Project } from '@bbp/nexus-sdk';

const DEFAULT_VISITED_MAX = 5;

interface RecentlyVisitedProps {
  visitProject: (project: Project) => void;
}

const RecentlyVisited: React.FunctionComponent<RecentlyVisitedProps> = ({
  visitProject,
}) => {
  const { previouslyVisitedList } = usePreviouslyVisited('visitedProjects');
  return previouslyVisitedList.length ? (
    <div className="recently-visited">
      <h3 className="label">
        <Icon type="clock-circle" /> Recently Visited
      </h3>
      <ul>
        {previouslyVisitedList.slice(0, DEFAULT_VISITED_MAX).map(project => {
          return (
            <ListItem
              onAllClick={() => {
                visitProject(project);
              }}
              key={project.label}
              label={project.label}
              id={project.label}
              description={project.description}
            />
          );
        })}
      </ul>
    </div>
  ) : null;
};

export default RecentlyVisited;
