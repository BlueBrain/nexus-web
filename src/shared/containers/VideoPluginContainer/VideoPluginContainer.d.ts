import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import '../../styles/video-plugin.less';
declare type VideoProps = {
  orgLabel: string;
  projectLabel: string;
  resource: Resource;
  collapsed: boolean;
  handleCollapseChanged: () => void;
};
declare const VideoPluginContainer: React.FunctionComponent<VideoProps>;
export default VideoPluginContainer;
