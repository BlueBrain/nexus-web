import { Resource } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation, useRouteMatch } from 'react-router';

import {
  AddNewNodeDataExplorerGraphFlow,
  InitNewVisitDataExplorerGraphView,
  TDELink,
} from '../../store/reducers/data-explorer';
import { getNormalizedTypes, getOrgAndProjectFromProjectId, getResourceLabel } from '../../utils';
import { download } from '../../utils/download';
import nexusUrlHardEncode from '../../utils/nexusEncode';
import { parseResourceId } from '../Preview/Preview';
import { getDataExplorerResourceItemArray } from './editorUtils';

const useResolvedLinkEditorPopover = () => {
  const nexus = useNexusContext();
  const dispatch = useDispatch();
  const navigate = useHistory();
  const routeMatch = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    resourceId: string;
  }>(`/:orgLabel/:projectLabel/resources/:resourceId`);

  const { pathname, search, state } = useLocation();

  const navigateResourceHandler = async (resource: TDELink) => {
    if (pathname === '/data-explorer/graph-flow') {
      dispatch(AddNewNodeDataExplorerGraphFlow(resource));
    } else if (routeMatch?.url && routeMatch.params) {
      const data = (await nexus.Resource.get(
        routeMatch.params.orgLabel,
        routeMatch.params.projectLabel,
        routeMatch.params.resourceId
      )) as Resource;
      const orgProject = getOrgAndProjectFromProjectId(data._project);
      dispatch(
        InitNewVisitDataExplorerGraphView({
          referer: { pathname, search, state },
          source: {
            _self: data._self,
            title: getResourceLabel(data),
            types: getNormalizedTypes(data['@type']),
            resource: getDataExplorerResourceItemArray(
              {
                orgLabel: orgProject?.orgLabel ?? '',
                projectLabel: orgProject?.projectLabel ?? '',
              },
              data
            ),
          },
          current: resource,
        })
      );
      navigate.push('/data-explorer/graph-flow');
    }
  };
  const downloadBinaryAsyncHandler = async ({
    orgLabel,
    projectLabel,
    resourceId,
    ext,
    title,
  }: {
    orgLabel: string;
    projectLabel: string;
    resourceId: string;
    title: string;
    ext?: string;
  }) => {
    try {
      const data = await nexus.File.get(
        orgLabel,
        projectLabel,
        nexusUrlHardEncode(parseResourceId(resourceId)),
        { as: 'blob' }
      );
      return download(title, ext ?? 'json', data);
    } catch (error) {
      throw error;
    }
  };

  return {
    navigateResourceHandler,
    downloadBinaryAsyncHandler,
  };
};

export default useResolvedLinkEditorPopover;
