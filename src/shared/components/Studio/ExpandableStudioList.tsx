import * as React from 'react';
import { Collapse, Button, Empty } from 'antd';
import { useHistory } from 'react-router-dom';

import StudioListItem from './StudioListItem';
import { StudioItem } from '../../views/StudioListView';
import { makeStudioUri } from '../../utils';

import './ExpandableStudioList.less';

const ExpandableStudioList: React.FC<{
  studios: StudioItem[];
  error: Error | null;
}> = ({ studios, error }) => {
  const history = useHistory();

  const goToStudio = (studio: StudioItem) => {
    const { orgLabel, projectLabel, id } = studio;

    history.push(makeStudioUri(orgLabel, projectLabel, id));
  };

  const studioUrlButton = (studio: StudioItem) => {
    const { orgLabel, projectLabel, id } = studio;

    return (
      <a
        href={makeStudioUri(orgLabel, projectLabel, id)}
        key={studio.id}
        onClick={e => {
          e.preventDefault();
          goToStudio(studio);
        }}
      >
        <Button type="primary" size="small">
          Go to Studio
        </Button>
      </a>
    );
  };

  if (error) {
    return (
      <div className="expandable-studio-list">
        <Empty description={error.message} />
      </div>
    );
  }

  if (studios && studios.length === 0) {
    return (
      <div className="expandable-studio-list">
        <Empty />
      </div>
    );
  }

  return (
    <div className="expandable-studio-list">
      <Collapse onChange={() => {}}>
        {studios.map((studio, index) => {
          return (
            <StudioListItem
              studio={studio}
              header={
                <div className="studio-title-panel">
                  <div>
                    <h3 className="studio-name">{studio.label}</h3>
                    <p className="studio-description">{studio.description}</p>
                  </div>
                  {studioUrlButton(studio)}
                </div>
              }
              key={`${index}`}
            />
          );
        })}
      </Collapse>
    </div>
  );
};

export default ExpandableStudioList;
