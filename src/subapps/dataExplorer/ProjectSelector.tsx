import { AutoComplete, Input } from 'antd';
import React, { useState } from 'react';
import { makeOrgProjectTuple } from '../../shared/molecules/MyDataTable/MyDataTable';
import { AggregatedBucket, useAggregations } from './DataExplorerUtils';
import './styles.less';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { normalizeString } from '../../utils/stringUtils';

interface Props {
  onSelect: (orgLabel?: string, projectLabel?: string) => void;
}

export const ProjectSelector: React.FC<Props> = ({ onSelect }: Props) => {
  const { data: projects } = useAggregations('projects');
  const [showClearIcon, setShowClearIcon] = useState(false);

  const allOptions = [
    { value: AllProjects, label: AllProjects },
    ...(projects?.map(projectToOption) ?? []),
  ];

  return (
    <div className="form-container">
      <span className="label">Project: </span>
      <AutoComplete
        options={allOptions}
        onSearch={text => {
          setShowClearIcon(text ? true : false);
        }}
        filterOption={(searchTerm, option) => {
          if (!option) {
            return false;
          }
          return normalizeString(option.value).includes(searchTerm);
        }}
        onSelect={text => {
          if (text === AllProjects) {
            setShowClearIcon(false);
            onSelect(undefined, undefined);
          } else {
            const [org, project] = text.split('/');
            setShowClearIcon(true);
            onSelect(org, project);
          }
        }}
        allowClear={true}
        clearIcon={<CloseOutlined data-testid="reset-project-button" />}
        onClear={() => onSelect(undefined, undefined)}
        placeholder={AllProjects}
        aria-label="project-filter"
        bordered={false}
        className="search-input"
        popupClassName="search-menu"
      >
        <Input
          size="middle"
          addonAfter={showClearIcon ? <CloseOutlined /> : <SearchOutlined />}
        />
      </AutoComplete>
    </div>
  );
};

export const AllProjects = 'All Projects';

const projectToOption = (
  projectBucket: AggregatedBucket
): { value: string; label: string } => {
  const { org, project } = makeOrgProjectTuple(projectBucket.key);
  return {
    value: `${org}/${project}`,
    label: `${org}/${project}`,
  };
};
