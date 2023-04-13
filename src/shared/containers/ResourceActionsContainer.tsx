import * as React from 'react';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import ResourceDownloadButton from './ResourceDownloadContainer';
import ResourceActions from '../components/ResourceActions';
import { getResourceLabel, getOrgAndProjectFromResource } from '../utils';
import { download } from '../utils/download';
import {
  isView,
  isFile,
  chainPredicates,
  not,
  isDefaultElasticView,
  isDeprecated,
  toPromise,
} from '../utils/nexusMaybe';
import useNotification from '../hooks/useNotification';
import RemoveTagButton from './RemoveTagButtonContainer';
import { parseResourceId } from '../components/Preview/Preview';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';

const ResourceActionsContainer: React.FunctionComponent<{
  resource: Resource;
  editable: boolean;
  refreshResource: () => void;
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
    revision: number
  ) => void;
}> = ({ resource, editable, refreshResource, goToView, goToResource }) => {
  const { orgLabel, projectLabel } = getOrgAndProjectFromResource(resource);
  const resourceId = resource['@id'];
  const self = resource._self;
  const nexus = useNexusContext();
  const notification = useNotification();

  const isLatestResource = async (resource: Resource) => {
    // TODO: remove this if / when
    // https://github.com/BlueBrain/nexus/issues/898 is implemented
    const latest = await nexus.httpGet({
      path: self,
      headers: {
        Accept: 'application/json', // just in case it's a file
      },
    });
    return resource._rev === latest._rev;
  };

  const actionTypes = [
    {
      name: 'deprecateResource',
      predicate: async (resource: Resource) => {
        const isLatest = await isLatestResource(resource);
        return (
          isLatest &&
          chainPredicates([isDefaultElasticView, not(isDeprecated)])(resource)
        );
      },
      title: 'Deprecate this resource',
      shortTitle: 'Dangerously Deprecate',
      message: (
        <div>
          <h3>Warning!</h3>
          <p>
            This is your default ElasticSearch View. Deprecating this resource
            will break this application for this project. Are you sure you want
            to deprecate it?
          </p>
        </div>
      ),
      icon: <DeleteOutlined />,
      danger: true,
    },
    {
      name: 'deprecateResource',
      predicate: async (resource: Resource) => {
        const isLatest = await isLatestResource(resource);
        return (
          isLatest &&
          chainPredicates([not(isDeprecated), not(isDefaultElasticView)])(
            resource
          )
        );
      },
      title: 'Deprecate this resource',
      message: "Are you sure you'd like to deprecate this resource?",
      shortTitle: 'Deprecate',
      icon: <DeleteOutlined />,
      danger: true,
    },
    {
      name: 'downloadFile',
      predicate: toPromise(isFile),
      title: 'Download this file',
      shortTitle: 'Download File',
      icon: <DownloadOutlined />,
    },
  ];

  const actions = {
    deprecateResource: async () => {
      try {
        let deprecateMethod: any = nexus.Resource.deprecate;
        if (isView(resource)) {
          deprecateMethod = nexus.View.deprecate;
        }

        if (isFile(resource)) {
          deprecateMethod = nexus.File.deprecate;
        }

        const deprectatedResource = await deprecateMethod(
          orgLabel,
          projectLabel,
          encodeURIComponent(resourceId),
          resource._rev
        );

        notification.success({
          message: `Deprecated ${getResourceLabel(resource)}`,
        });

        const { _rev } = deprectatedResource;
        goToResource(
          orgLabel,
          projectLabel,
          encodeURIComponent(resourceId),
          _rev
        );
      } catch (error) {
        notification.error({
          message: `Could not deprecate ${getResourceLabel(resource)}`,
          description: error,
        });
      }
    },
    goToView: () => {
      return goToView(
        orgLabel,
        projectLabel,
        encodeURIComponent(resourceId),
        resource['@type'] as string[]
      );
    },
    downloadFile: async () => {
      try {
        const data = await nexus.File.get(
          orgLabel,
          projectLabel,
          parseResourceId(resource._self),
          { as: 'blob' }
        );
        return download(
          resource._filename || getResourceLabel(resource),
          resource._mediaType,
          data
        );
      } catch (error) {
        notification.error({
          message: `Could not download ${getResourceLabel(resource)}`,
        });
      }
    },
  };

  return (
    <div className="resource-actions-container">
      <div className="resource-actions">
        <ResourceDownloadButton
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          resourceId={encodeURIComponent(resourceId)}
        />
        <ResourceActions
          resource={resource}
          actions={actions}
          actionTypes={actionTypes}
        />
        {editable && (
          <RemoveTagButton
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            resourceId={encodeURIComponent(resourceId)}
            revision={resource._rev}
            refreshResource={refreshResource}
          />
        )}
      </div>
    </div>
  );
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
    revision: number
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

export default connect(null, mapDispatchToProps)(ResourceActionsContainer);
