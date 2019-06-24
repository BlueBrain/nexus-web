import * as React from 'react';
import usePreviouslyVisited from '../hooks/usePreviouslyVisited';
import ListItem from '../Animations/ListItem';
import './recently-visited.less';
import { Icon } from 'antd';
import { Project } from '@bbp/nexus-sdk-legacy';

const DEFAULT_VISITED_MAX = 5;

interface RecentlyVisitedProps {
  visitProject: (orgLabel: string, projectLabel: string) => void;
}

const RecentlyVisited: React.FunctionComponent<RecentlyVisitedProps> = ({
  visitProject,
}) => {
  const { previouslyVisitedList } = usePreviouslyVisited('visitedProjects');
  return (
    <div className="recently-visited">
      <h4 className="label">
        <Icon type="clock-circle" /> Recently Visited
      </h4>
      <ul>
        {previouslyVisitedList.slice(0, DEFAULT_VISITED_MAX).map(project => {
          return (
            <ListItem
              onClick={() => {
                visitProject(project.orgLabel, project.label);
              }}
              key={project.label}
              label={`${project.orgLabel} / ${project.label}`}
              id={project.label}
              description={project.description}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default RecentlyVisited;
