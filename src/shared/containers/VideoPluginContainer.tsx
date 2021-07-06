import * as React from 'react';
import ResourceMetadata from '../components/ResourceMetadata';
import { Resource } from '@bbp/nexus-sdk';
import { Collapse } from 'antd';
const { Panel } = Collapse;

type VideoProps = {
  resource: Resource;
};

const VideoPlugin: React.FunctionComponent<VideoProps> = ({
  resource,
}) => {
  return (
    <Collapse onChange={() => {}}>
      <Panel header="Video" key="1">
        <ResourceMetadata resource={resource} />

        <iframe
          width="853"
          height="480"
          src={resource['video']['embedUrl']}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded video"
        />
      </Panel>
    </Collapse>
  );
};

export default VideoPlugin;
