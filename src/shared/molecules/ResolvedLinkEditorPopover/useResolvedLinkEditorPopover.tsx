import { useNexusContext } from '@bbp/react-nexus';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { Resource } from '@bbp/nexus-sdk';
import { RootState } from '../../store/reducers';
import { UISettingsActionTypes } from '../../store/actions/ui-settings';
import {
  TDELink,
  AddNewNodeDataExplorerGraphFlow,
  InitNewVisitDataExplorerGraphView,
} from '../../store/reducers/data-explorer';
import { editorPopoverResolvedDataInitialValue } from '../../store/reducers/ui-settings';
import {
  getNormalizedTypes,
  getOrgAndProjectFromProjectId,
  getResourceLabel,
} from '../../utils';
import { parseResourceId } from '../../components/Preview/Preview';
import { download } from '../../utils/download';

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

  const clickOutsideHandler = () => {
    dispatch({
      type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
      payload: editorPopoverResolvedDataInitialValue,
    });
  };
  const navigateResourceHandler = async (resource: TDELink) => {
    clickOutsideHandler();
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
            resource: [
              orgProject?.orgLabel ?? '',
              orgProject?.projectLabel ?? '',
              data['@id'],
            ],
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
        encodeURIComponent(parseResourceId(resourceId)),
        { as: 'blob' }
      );
      return download(title, ext ?? 'json', data);
    } catch (error) {
      throw error;
    }
  };

  return {
    clickOutsideHandler,
    navigateResourceHandler,
    downloadBinaryAsyncHandler,
  };
};

export default useResolvedLinkEditorPopover;
