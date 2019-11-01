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
  goToResource: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    revision: number,
  ) => void;
}> = ({ resource, goToView, goToResource }) => {
  const {
    orgLabel,
    projectLabel,
    resourceId,
  } = getResourceLabelsAndIdsFromSelf(resource._self);
  const nexus = useNexusContext();

  const actions = {
    deprecateResource: async () => {
      try {
        const deprectatedResource = await nexus.Resource.deprecate(
          orgLabel,
          projectLabel,
          resourceId,
          resource._rev
        );

        notification.success({
          message: `Deprecated ${getResourceLabel(resource)}`,
        });

        const { _rev } = deprectatedResource;
        goToResource(orgLabel, projectLabel, resourceId, _rev);
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
  goToResource: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    revision: number,
  ) => {
    dispatch(
      push(
        `/${orgLabel}/${projectLabel}/resources/${resourceId}${
          revision ? `?rev=${revision}` : ''
        }`
      )
    );
  },
});

export default connect(
  null,
  mapDispatchToProps
)(ResourceActionsContainer);
