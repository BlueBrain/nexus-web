import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import ReactPlayer from 'react-player';
import * as moment from 'moment';
import { Collapse, Modal, Button, List, Alert } from 'antd';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
require('ajv-errors')(ajv, { singleError: true });
import '../../styles/video-plugin.less';
import { getDateString } from '../../utils';
import * as schema from './schema.json';
const { Panel } = Collapse;

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
  const [validationError, setValidationError] = React.useState<any>();
  const validate = React.useMemo(() => ajv.compile(schema), [
    resource,
    orgLabel,
    projectLabel,
  ]);

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

  React.useEffect(() => {
    if (!validate(resource)) {
      if (validate.errors && validate.errors.length > 0) {
        setValidationError(validate.errors);
      } else {
        setValidationError('Data does not match pattern required by plugin');
      }
    }
  }, [resource, orgLabel, projectLabel]);

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
    )) as Resource<{
      video: VideoObject[];
    }>;

    const videoData = videoResource.video
      ? ([videoResource.video].flat() as VideoObject[])
      : undefined;

    setVideoData(videoData);
  };

  if (!videoData) return null;

  const videoJsx = (
    <>
      <List
        itemLayout="horizontal"
        dataSource={videoData}
        renderItem={(item: any) => (
          <List.Item
            extra={
              item.duration &&
              item.uploadDate && (
                <div>
                  <p>{moment.duration(item.duration).humanize()}</p>
                  <p>{getDateString(item.uploadDate, { noTime: true })}</p>
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
        )}
      />
      {selectedVideo && !!selectedVideo.name ? (
        <Modal
          title={selectedVideo.name}
          bodyStyle={{ padding: 0 }}
          visible={isModalVisible && !!selectedVideo}
          onOk={handleOk}
          onCancel={handleCancel}
          width={640}
          footer={null}
        >
          {!!selectedVideo.embedUrl ? (
            <ReactPlayer url={selectedVideo.embedUrl} />
          ) : null}
        </Modal>
      ) : null}
    </>
  );
  console.log({ validationError });
  return (
    <Collapse
      activeKey={collapsed ? 'video' : undefined}
      onChange={e => handleCollapseChanged()}
    >
      <Panel header="Video" key="video">
        {validationError ? (
          <Alert
            message={
              <>
                The shape of the data is not as expected for this plugin, see{' '}
                <a href="" target="_blank">
                  README
                </a>{' '}
                for expected shape. See below for error details:
                <br />
                <br />
                <ul>
                  {validationError.map((e: any, i: number) => (
                    <React.Fragment key={i}>
                      <li>{e.message}</li>
                    </React.Fragment>
                  ))}
                </ul>
              </>
            }
            type="error"
          />
        ) : (
          videoJsx
        )}
      </Panel>
    </Collapse>
  );
};

export default VideoPluginContainer;
