import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Collapse } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import ReactPlayer from 'react-player';
import { Modal } from 'antd';
import useNotification from '../hooks/useNotification';

const { Panel } = Collapse;

type VideoProps = {
  orgLabel: string;
  projectLabel: string;
  resourceId: string;
  resource: Resource;
  latestResource: Resource;
};

type VideoObject = {
  name: String;
  description: String;
  thumbnailUrl: [];
  uploadDate: Date;
  duration: String;
  embedUrl: String;
};

const VideoPluginContainer: React.FunctionComponent<VideoProps> = ({
  resource,
  latestResource,
  orgLabel,
  resourceId,
  projectLabel,
}) => {
  const nexus = useNexusContext();
  const [videoData, setVideoData] = React.useState<any>();
  const notification = useNotification();

  React.useEffect(() => {
    loadVideo();
  }, []);

  const loadVideo = async () => {
    await nexus.Resource.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(resource['@id'])
    )
      .then(response => {
        const resource = response as Resource;
        console.log(resource);
        const videoData = response;
        setVideoData(videoData);
      })
      .catch(error =>
        notification.error({
          message: 'Failed to load file',
        })
      );
  };
  if (!videoData) return null;
  return (
    <Collapse onChange={() => {}}>
      <Panel header="Video" key="1">
        {videoData.map((v: any, k: number) => (
          <li key={k}>{v.name}</li>
        ))}
        {/* <ReactPlayer url={videoData} /> */}
      </Panel>
    </Collapse>
  );
};

export default VideoPluginContainer;
