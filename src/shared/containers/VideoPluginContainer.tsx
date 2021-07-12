import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Collapse } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import ReactPlayer from 'react-player';

import useNotification from '../hooks/useNotification';

const { Panel } = Collapse;

type VideoProps = {
  resource: Resource;
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
}) => {
  const nexus = useNexusContext();
  const [videoData, setVideoData] = React.useState<string>();
  const notification = useNotification();

  React.useEffect(() => {
    loadVideo();
  }, []);

  const loadVideo = async () => {
    console.log('RESOURCE');
    console.log(resource);
    const videoData = 'https://www.youtube.com/watch?v=ysz5S6PUM-U';
    setVideoData(videoData);
  };

  if (!videoData) return null;
  return (
    <Collapse onChange={() => {}}>
      <Panel header="Video" key="1">
        {/* {resource['video'].map((v: VideoObject, k: number) => (
          <li key={k}>{v.name}</li>
        ))} */}
        <ReactPlayer url={videoData} />
        {/* <iframe
          width="853"\
          height="480"
          src={resource['video']['embedUrl']}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded youtube"
        /> */}
      </Panel>
    </Collapse>
  );
};

export default VideoPluginContainer;
