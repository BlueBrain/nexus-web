import * as React from 'react';
import usePreviouslyVisited from '../hooks/usePreviouslyVisited';
import './recently-visited.less';
import { Icon, Tag } from 'antd';
import ListItem from '../List/Item';

const DEFAULT_VISITED_MAX = 5;

interface RecentlyVisitedProps {
  visitProject(orgLabel: string, projectLabel: string): void;
}

const RecentlyVisited: React.FunctionComponent<RecentlyVisitedProps> = ({
  visitProject,
}) => {
  const { previouslyVisitedList } = usePreviouslyVisited('visitedProjects');
  return (
    <div className="recently-visited">
      <h3 className="label">
        <Icon type="clock-circle" /> Recently Visited
      </h3>
      <ul>
        {previouslyVisitedList.slice(0, DEFAULT_VISITED_MAX).map(project => {
          return (
            <ListItem
              onClick={() => {
                visitProject(project.orgLabel, project.label);
              }}
              key={project.label}
            >
              <div className="project-item">
                <p className="label">
                  {project.orgLabel} / {project.label}
                </p>
                {project.deprecated && <Tag color="red">deprecated</Tag>}
                {project.description && (
                  <p className="description">{project.description}</p>
                )}
              </div>
            </ListItem>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentlyVisited;
