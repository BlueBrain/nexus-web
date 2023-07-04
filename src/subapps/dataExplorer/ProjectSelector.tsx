import { ProjectResponseCommon } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { AutoComplete, Input, notification } from 'antd';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import './styles.less';

interface Props {
  onSelect: (orgLabel?: string, projectLabel?: string) => void;
}

export const ProjectSelector: React.FC<Props> = ({ onSelect }: Props) => {
  const { data: projects } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');

  const allOptions = [
    { value: AllProjects, label: AllProjects },
    ...(projects?.map(projectToOption) ?? []),
  ].filter(project => project.value.includes(searchTerm));

  return (
    <div className="form-container">
      <span className="label">Show me </span>
      <AutoComplete
        options={allOptions}
        style={{ width: 200 }}
        defaultValue={AllProjects}
        onSearch={text => {
          setSearchTerm(normalizeSearchTerm(text));
        }}
        onSelect={text => {
          if (text === AllProjects) {
            onSelect(undefined, undefined);
          } else {
            const [org, project] = text.split('/');
            onSelect(org, project);
          }
        }}
        aria-label="project-filter"
        bordered={false}
        className="search-input"
        popupClassName="search-menu"
      >
        <Input.Search size="middle" />
      </AutoComplete>
    </div>
  );
};

export const AllProjects = 'All Projects';

const projectToOption = (
  project: ProjectResponseCommon
): { value: string; label: string } => {
  return {
    value: `${project._organizationLabel}/${project._label}`,
    label: `${project._organizationLabel}/${project._label}`,
  };
};

const useProjects = () => {
  const nexus = useNexusContext();
  return useQuery({
    queryKey: ['data-explorer-projects'],
    retry: false,
    queryFn: async () => {
      // TODO: Replace this with aggregation API when it is ready.
      // NOTE: At the moment it is not possible to get all projects a user has access to in 1 request. To get around this, we make 2 requests:
      // 1st request -> Get the total number of projects (n) a user can see
      // 2nd request -> Use the total retrieved from above request to specify the size of the projects to return.
      const firstPageOfProjects = await nexus.Project.list(undefined, {
        size: 1,
      });
      const allProjects = await nexus.Project.list(undefined, {
        size: firstPageOfProjects._total,
      });

      return allProjects._results;
    },
    onError: error => {
      notification.error({ message: 'Projects could not be fetched' });
    },
  });
};

const normalizeSearchTerm = (text: string) => text.trim().toLowerCase();
