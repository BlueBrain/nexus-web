import React, { useEffect } from 'react';
import {
  ExpandedResource,
  ResourceSource,
  Resource,
  NexusClient,
} from '@bbp/nexus-sdk/es';
import { useHistory, useLocation } from 'react-router';
import { useDispatch } from 'react-redux';
import { pick } from 'lodash';
import { useNexusContext } from '@bbp/react-nexus';
import ResourceEditor from '../components/ResourceEditor';
import { getDataExplorerResourceItemArray } from '../components/ResourceEditor/editorUtils';
import useNotification, { parseNexusError } from '../hooks/useNotification';
import {
  InitDataExplorerGraphFlowFullscreenVersion,
  InitNewVisitDataExplorerGraphView,
} from '../store/reducers/data-explorer';
import {
  getNormalizedTypes,
  getOrgAndProjectFromResourceObject,
  getResourceLabel,
} from '../utils';

const ResourceEditorContainer: React.FunctionComponent<{
  rev: number;
  orgLabel: string;
  resourceId: string;
  tabChange?: boolean;
  projectLabel: string;
  showExpanded?: boolean;
  showFullScreen: boolean;
  defaultExpanded?: boolean;
  defaultEditable?: boolean;
  showControlPanel?: boolean;
  showMetadataToggle?: boolean;
  onSubmit: (value: object) => void;
  onExpanded?: (expanded: boolean) => void;
}> = ({
  rev,
  orgLabel,
  tabChange,
  resourceId,
  projectLabel,
  showExpanded,
  showMetadataToggle,
  showFullScreen = false,
  defaultEditable = false,
  defaultExpanded = false,
  showControlPanel = true,
  onSubmit,
  onExpanded,
}) => {
  const dispatch = useDispatch();
  const nexus = useNexusContext();
  const navigate = useHistory();
  const location = useLocation();
  const notification = useNotification();
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [editable, setEditable] = React.useState(defaultEditable);
  const [showMetadata, setShowMetadata] = React.useState<boolean>(false);
  const [{ busy, resource }, setResource] = React.useState<{
    busy: boolean;
    resource: ResourceSource | ExpandedResource | Resource | null;
    error: Error | null;
  }>({
    busy: false,
    resource: null,
    error: null,
  });

  useEffect(() => {
    setResource({
      resource,
      error: null,
      busy: true,
    });
    setEditable(defaultEditable);
    if (resource?.['@type']?.includes('File')) {
      setEditable(false);
    }

    getNewResource()
      .then(response =>
        setResource({
          resource: response as Resource,
          error: null,
          busy: false,
        })
      )
      .catch(error => {
        notification.error({
          message: 'Failed to load JSON payload',
          description: parseNexusError(error),
        });
        setResource({
          error,
          resource: null,
          busy: false,
        });
      });
  }, [
    resourceId,
    projectLabel,
    orgLabel,
    rev,
    expanded,
    showMetadata,
    tabChange,
    defaultEditable,
  ]);

  const handleFormatChange = () => {
    onExpanded && onExpanded(!expanded);
    setExpanded(value => !value);
  };

  const handleMetaDataChange = () => {
    setShowMetadata(!showMetadata);
  };

  const handleFullScreen = async () => {
    const data = (await nexus.Resource.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(resourceId),
      {
        rev,
      }
    )) as Resource;
    const orgProject = getOrgAndProjectFromResourceObject(data);
    if (location.pathname === '/data-explorer/graph-flow') {
      dispatch(
        InitDataExplorerGraphFlowFullscreenVersion({ fullscreen: true })
      );
    } else {
      dispatch(
        InitNewVisitDataExplorerGraphView({
          referer: pick(location, ['pathname', 'search', 'state']),
          current: {
            _self: data._self,
            types: getNormalizedTypes(data['@type']),
            title: getResourceLabel(data),
            resource: getDataExplorerResourceItemArray(
              orgProject ?? { orgLabel: '', projectLabel: '' },
              data
            ),
          },
          fullscreen: true,
        })
      );
      navigate.push('/data-explorer/graph-flow');
    }
  };

  const getResourceSource = async (
    nexus: NexusClient,
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    rev: number
  ) => {
    try {
      return await nexus.Resource.getSource(
        orgLabel,
        projectLabel,
        encodeURIComponent(resourceId),
        undefined,
        { rev }
      );
    } catch {
      return {} as ResourceSource;
    }
  };

  const getNewResource = async () => {
    if (expanded) {
      const expandedResource = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(resourceId),
        {
          rev,
          format: 'expanded',
        }
      )) as ExpandedResource[];
      return expandedResource[0];
    }
    if (showMetadata) {
      return await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(resourceId),
        {
          rev,
        }
      );
    }

    return await getResourceSource(
      nexus,
      orgLabel,
      projectLabel,
      resourceId,
      rev
    );
  };

  return (
    resource && (
      <ResourceEditor
        key={(resource as Resource)._self}
        busy={busy}
        rawData={resource}
        onSubmit={onSubmit}
        onFormatChange={handleFormatChange}
        onMetadataChange={handleMetaDataChange}
        editable={editable && !expanded && !showMetadata}
        expanded={expanded}
        showMetadata={showMetadata}
        showMetadataToggle={showMetadataToggle}
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        showFullScreen={showFullScreen}
        onFullScreen={handleFullScreen}
        showExpanded={showExpanded}
        showControlPanel={showControlPanel}
      />
    )
  );
};

export default ResourceEditorContainer;
