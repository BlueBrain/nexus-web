import * as React from 'react';
import { Empty, Spin } from 'antd';
import useMeasure from '../../hooks/useMeasure';

import ListItem from '../List/Item';

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

const LIST_HEIGHT_ADJUSTMENT = 100;

const StudioList: React.FC<{
  studios: StudioItemProps[];
  busy?: boolean;
  error?: Error | null;
  goToStudio?(studioId: string): void;
  createStudioButton?: React.ReactElement;
}> = ({
  studios,
  busy,
  error,
  goToStudio = () => {},
  createStudioButton = null,
}) => {
  const [{ ref: wrapperHeightRef }, { height: wrapperHeight }] = useMeasure();
  const noStudios = studios.length === 0;

  return (
    <div className="resource-list-height-tester" ref={wrapperHeightRef}>
      <div className="studio-list">
        <h3>Studios</h3>
        <Spin spinning={busy}>
          {error && (
            <Empty description={error.message || 'An error occurred'} />
          )}
          {!error && noStudios && <Empty description="No studios available" />}
          {createStudioButton}
          {!noStudios && (
            <div
              style={{
                overflowY: 'auto',
                height: wrapperHeight - LIST_HEIGHT_ADJUSTMENT,
              }}
            >
              {studios.map(studio => (
                <ListItem onClick={() => goToStudio(studio.id)} key={studio.id}>
                  <StudioItem {...studio} />
                </ListItem>
              ))}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default StudioList;
