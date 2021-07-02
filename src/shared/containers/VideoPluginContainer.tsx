import * as React from 'react';
import PropTypes from 'prop-types';
import { Resource, ResourceLink } from '@bbp/nexus-sdk';
import { Tabs, Collapse } from 'antd';
import HistoryContainer from '../containers/HistoryContainer';
import ResourceLinksContainer from '../containers/ResourceLinks';
import ResourceActionsContainer from '../containers/ResourceActionsContainer';
import ResourceEditorContainer from '../containers/ResourceEditor';
import SchemaLinkContainer from '../containers/SchemaLink';
import GraphContainer from '../containers/GraphContainer';
import ResourceMetadata from '../components/ResourceMetadata';
import MarkdownEditorContainer from './MarkdownEditorContainer';

const { Panel } = Collapse;
const TabPane = Tabs.TabPane;

type VideoProps = {
  editable: boolean;
  orgLabel: string;
  projectLabel: string;
  embedId: string;
};

const VideoPlugin: React.FunctionComponent<VideoProps> = ({
  editable,
  projectLabel,
  orgLabel,
  embedId,
}) => {
  return (
    <div className="App">
      <h1>Youtube Embed</h1>
      <div className="video-responsive">
        <iframe
          width="853"
          height="480"
          src={`https://www.youtube.com/embed/${embedId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded youtube"
        />
      </div>
    </div>
  );
};

export default VideoPlugin;
