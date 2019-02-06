import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Spin, Card } from 'antd';
import { ResourceMetadataCard } from './ResourceItem';

let ReactJson: any;
if (typeof window !== 'undefined') {
  ReactJson = require('react-json-view').default;
}

export interface ResourceViewProps {
  resource: Resource | null;
  error: Error | null;
  isFetching: boolean | false;
}

const ResourceView: React.FunctionComponent<ResourceViewProps> = props => {
  const { resource, error, isFetching } = props;
  return (
    <div className="resource">
      <Spin spinning={isFetching}>
        {!!resource && (
          <>
            <ResourceMetadataCard {...resource} />
            {typeof window !== 'undefined' && resource && (
              <Card style={{ marginTop: '1em', backgroundColor: '#9e9e9e1a' }}>
                <ReactJson
                  src={resource.data}
                  name={null}
                  collapseStringsAfterLength={50}
                />
              </Card>
            )}
          </>
        )}
      </Spin>
    </div>
  );
};

export default ResourceView;
