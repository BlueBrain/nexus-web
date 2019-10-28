import * as React from 'react';
import { notification } from 'antd';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ResourceActions from '../components/ResourceActions';
import { getResourceLabelsAndIdsFromSelf, getResourceLabel } from '../utils';
import { download } from '../utils/download';

const ResourceActionsContainer: React.FunctionComponent<{
  resource: Resource;
  goToView: (
    orgLabel: string,
    projectLabel: string,
    viewId: string,
    viewType: string[] | string
  ) => void;
}> = ({ resource, goToView }) => {
  const {
    orgLabel,
    projectLabel,
    resourceId,
  } = getResourceLabelsAndIdsFromSelf(resource._self);
  const nexus = useNexusContext();

  const actions = {
    deprecateResource: async () => {
      try {
        await nexus.Resource.deprecate(
          orgLabel,
          projectLabel,
          resourceId,
          resource._rev
        );
        notification.success({
          message: `Deprecated ${getResourceLabel(resource)}`,
        });
        location && location.reload();
      } catch (error) {
        notification.error({
          message: `Could not deprecate ${getResourceLabel(resource)}`,
          description: error,
        });
      }
    },
    goToView: () => {
      return goToView(orgLabel, projectLabel, resourceId, resource[
        '@type'
      ] as string[]);
    },
    downloadFile: async () => {
      try {
        const data = await nexus.File.get(orgLabel, projectLabel, resourceId, {
          as: 'blob',
        });
        return download(
          resource._filename || getResourceLabel(resource),
          resource._mediaType,
          data
        );
      } catch (error) {
        notification.error({
          message: `Could not download ${getResourceLabel(resource)}`,
          description: error,
        });
      }
    },
  };

  return <ResourceActions resource={resource} actions={actions} />;
};

const mapDispatchToProps = (dispatch: any) => ({
  goToView: (
    orgLabel: string,
    projectLabel: string,
    viewId: string,
    viewType: string[] | string
  ) => {
    const stringifiedViewType = Array.isArray(viewType)
      ? viewType.join('')
      : viewType;
    return dispatch(
      push(
        `/${orgLabel}/${projectLabel}/${encodeURIComponent(viewId)}/${
          stringifiedViewType.toLowerCase().includes('elastic')
            ? '_search'
            : 'sparql'
        }`
      )
    );
  },
});

export default connect(
  null,
  mapDispatchToProps
)(ResourceActionsContainer);
