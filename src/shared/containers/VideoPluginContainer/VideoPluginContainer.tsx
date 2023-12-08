import '../../styles/video-plugin.scss';

import { Resource } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, Collapse, List, Modal, notification } from 'antd';
import moment from 'moment';
import * as React from 'react';
import ReactPlayer from 'react-player';

import { getDateString } from '../../utils';
import SchemaValidationFallbackContainer from '../SchemaValidationFallbackContainer';
import * as schema from './schema.json';

type VideoProps = {
  orgLabel: string;
  projectLabel: string;
  resource: Resource;
  collapsed: boolean;
  handleCollapseChanged: () => void;
};

type VideoObject = {
  name: string;
  description: string;
  thumbnailUrl: [];
  uploadDate: Date;
  duration: string;
  embedUrl: string;
};

const VideoPluginContainer: React.FunctionComponent<VideoProps> = ({
  resource,
  orgLabel,
  projectLabel,
  collapsed,
  handleCollapseChanged,
}) => {
  const nexus = useNexusContext();
  const [videoData, setVideoData] = React.useState<any>();
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = React.useState<any>();

  const handleOk = () => {
    const isModalVisible = false;
    setIsModalVisible(isModalVisible);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedVideo(null);
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
    try {
      const videoResource = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(resource['@id'])
      )) as Resource<{
        video: VideoObject[];
      }>;

      const videoData = videoResource.video
        ? ([videoResource.video].flat() as VideoObject[])
        : undefined;

      setVideoData(videoData);
    } catch (e) {
      notification.info({
        message: 'Error fetching video data',
      });
    }
  };

  return (
    <Collapse
      activeKey={collapsed ? 'video' : undefined}
      onChange={handleCollapseChanged}
      data-testid="collapse-item-video"
      className="collapse-item-video"
      items={[
        {
          key: 'video',
          label: 'Video',
          forceRender: true,
          children: (
            <SchemaValidationFallbackContainer
              schema={schema}
              resource={resource}
              dependencies={[resource, projectLabel, orgLabel]}
            >
              <>
                <List
                  itemLayout="horizontal"
                  dataSource={videoData}
                  renderItem={(item: any) => {
                    return (
                      <List.Item
                        extra={
                          item.duration &&
                          item.uploadDate && (
                            <div>
                              <p>{moment.duration(item.duration).humanize()}</p>
                              <p>
                                {getDateString(item.uploadDate, {
                                  noTime: true,
                                })}
                              </p>
                            </div>
                          )
                        }
                      >
                        <List.Item.Meta
                          avatar={<ReactPlayer url={item.embedUrl} light={true} />}
                          title={
                            <Button
                              type="link"
                              onClick={() => {
                                handleSelectedVideo(item);
                              }}
                            >
                              {item.name ? item.name : 'Video Name'}
                            </Button>
                          }
                          description={
                            item.description
                              ? item.description
                              : 'Description of video when information available'
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
                {selectedVideo && !!selectedVideo.name ? (
                  <Modal
                    title={selectedVideo.name}
                    bodyStyle={{ padding: 0 }}
                    open={isModalVisible && !!selectedVideo}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    width={640}
                    footer={null}
                  >
                    {selectedVideo.embedUrl ? <ReactPlayer url={selectedVideo.embedUrl} /> : null}
                  </Modal>
                ) : null}
              </>
            </SchemaValidationFallbackContainer>
          ),
        },
      ]}
    />
  );
};

export default VideoPluginContainer;
