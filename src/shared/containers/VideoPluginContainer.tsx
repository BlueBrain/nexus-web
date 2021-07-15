import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import ReactPlayer from 'react-player';
import ytImage from '../images/yt_icon_rgb.png';
import {
  Descriptions,
  Collapse,
  Modal,
  Button,
  Image,
  List,
  Avatar,
  Space,
} from 'antd';
import {
  MessageOutlined,
  LikeOutlined,
  StarOutlined,
  PlaySquareOutlined,
} from '@ant-design/icons';
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
    console.log(selectedVideo);
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
        {videoData ? (
          <List
            itemLayout="vertical"
            dataSource={videoData}
            renderItem={(item: any) => (
              <List.Item
                extra={
                  <img width={272} alt="logo" src={item.thumbnailUrl[0]} />
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      shape="square"
                      size="large"
                      icon={<PlaySquareOutlined />}
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
        ) : null}

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
            {selectedVideo && !!selectedVideo['embedUrl'] ? (
              // <ReactPlayer url={selectedVideo['embedUrl']} />
              <ReactPlayer url="https://www.youtube.com/watch?v=ysz5S6PUM-U" />
            ) : null}
          </Modal>
        ) : null}
      </Panel>
    </Collapse>
  );
};

export default VideoPluginContainer;
