import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import ReactPlayer from 'react-player';
import * as moment from 'moment';
import { Collapse, Modal, Button, List, Avatar } from 'antd';

import '../styles/video-plugin.less';

const { Panel } = Collapse;

type VideoProps = {
  orgLabel: string;
  projectLabel: string;
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
  orgLabel,
  projectLabel,
}) => {
  const nexus = useNexusContext();
  const [videoData, setVideoData] = React.useState<any>();
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = React.useState<any>();

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  React.useEffect(() => {
    loadVideo();
  }, []);

  const handleSelectedVideo = (video: any) => {
    const selectedVideo = video;
    setSelectedVideo(selectedVideo);
    setIsModalVisible(true);
  };
  const loadVideo = async () => {
    const videoResource = (await nexus.Resource.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(resource['@id'])
    )) as Resource;

    const videoData = [...[], videoResource['video'] || []];
    setVideoData(videoData);
  };
  if (!videoData) return null;
  return (
    <Collapse onChange={() => {}}>
      <Panel header="Video" key="1">
        <List
          itemLayout="horizontal"
          dataSource={videoData}
          renderItem={(item: any) => (
            <List.Item
              extra={
                <div>
                  <p>{moment.duration(item.duration).humanize()}</p>
                  <p>{moment(item.uploadDate).format('DD/MM/YYYY')}</p>
                </div>
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      width: '100%',
                    }}
                    src={item.thumbnailUrl[0]}
                    shape="square"
                    size={100}
                  />
                }
                title={
                  <Button
                    type="link"
                    onClick={() => {
                      handleSelectedVideo(item);
                    }}
                  >
                    {item.name}
                  </Button>
                }
                description={item.description}
              />
            </List.Item>
          )}
        />
        )
        {selectedVideo && !!selectedVideo['name'] ? (
          <Modal
            title={selectedVideo['name']}
            bodyStyle={{ padding: 0 }}
            visible={isModalVisible && !!selectedVideo}
            onOk={handleOk}
            onCancel={handleCancel}
            width={640}
            footer={null}
          >
            {!!selectedVideo['embedUrl'] ? (
              <ReactPlayer url={selectedVideo['embedUrl']} />
            ) : null}
          </Modal>
        ) : null}
      </Panel>
    </Collapse>
  );
};

export default VideoPluginContainer;
