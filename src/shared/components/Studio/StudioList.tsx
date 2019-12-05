import * as React from 'react';
import { Empty, Spin } from 'antd';

import ListItem from '../List/Item';
import CreateStudioContainer from '../../containers/CreateStudioContainer';

import './Studio.less';

type StudioItemProps = {
  id: string;
  name: string;
  description?: string;
};

const StudioItem: React.FC<StudioItemProps> = ({ name, description }) => {
  return (
    <div className="studio-item">
      <p className="label">{name}</p>
      {description && <p className="description">{description}</p>}
    </div>
  );
};

const StudioList: React.FC<{
  studios: StudioItemProps[];
  busy?: boolean;
  error?: Error | null;
  goToStudio?(studioId: string): void;
  orgLabel: string,
  projectLabel: string,
}> = ({ studios, busy, error, goToStudio = () => {}, orgLabel, projectLabel }) => {
  const noStudios = studios.length === 0;

  return (
    <div className="studio-list">
      <h3>Studios</h3>
      <Spin spinning={busy}>
        {error && <Empty description={error.message || 'An error occurred'} />}
        {!error && noStudios && <Empty description="No studios available" />}
        <CreateStudioContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          goToStudio={goToStudio}
        />
        {!noStudios && (
          <div>
            {studios.map(studio => (
              <ListItem onClick={() => goToStudio(studio.id)} key={studio.id}>
                <StudioItem {...studio} />
              </ListItem>
            ))}
          </div>
        )}
      </Spin>
    </div>
  );
};

export default StudioList;
