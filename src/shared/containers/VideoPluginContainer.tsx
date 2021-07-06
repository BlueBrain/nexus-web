import * as React from 'react';
import ResourceMetadata from '../components/ResourceMetadata';
import { Resource, ResourceLink } from '@bbp/nexus-sdk';
import { Collapse } from 'antd';

const { Panel } = Collapse;

type VideoProps = {
  resource: Resource;
  goToResource: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    opt: {
      revision?: number;
      tab?: string;
      expanded?: boolean;
    }
  ) => void;
  handleExpanded: (expanded: boolean) => void;
  handleTabChange: (activeTabKey: string) => void;
};

const VideoPlugin: React.FunctionComponent<VideoProps> = ({
  resource,
  goToResource,
  handleExpanded,
  handleTabChange,
}) => {
  const [tabChange, setTabChange] = React.useState<boolean>(false);
  const onTabChange = (tab: string) => {
    // forces a tab to rerender - otherwise RecourceEditor shifts its content left (codemirror issue)
    setTabChange(!tabChange);
    handleTabChange(tab);
  };
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
          title="Embedded youtube"
        />
      </Panel>
    </Collapse>
  );
};

export default VideoPlugin;
