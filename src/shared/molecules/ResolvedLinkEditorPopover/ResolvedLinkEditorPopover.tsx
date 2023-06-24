import React, { ReactNode, useRef, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient, Resource } from '@bbp/nexus-sdk';
import { clsx } from 'clsx';
import { Tag, Divider } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { match as pmatch } from 'ts-pattern';
import { UISettingsActionTypes } from '../../store/actions/ui-settings';
import { RootState } from '../../store/reducers';
import {
  TDELink,
  InitNewVisitDataExplorerGraphView,
  AddNewNodeDataExplorerGraphFlow,
} from '../../store/reducers/data-explorer';
import {
  TEditorPopoverResolvedData,
  editorPopoverResolvedDataInitialValue,
} from '../../store/reducers/ui-settings';
import { getOrgAndProjectFromProjectId, getResourceLabel } from '../../utils';
import { getNormalizedTypes } from '../../components/ResourceEditor';
import { download } from '../../utils/download';
import { parseResourceId } from '../../components/Preview/Preview';
import useOnClickOutside from '../../hooks/useClickOutside';
import './styles.less';

type TResultPattern = Pick<TEditorPopoverResolvedData, 'open' | 'resolvedAs'>;
type PopoverContainer = {
  children: ReactNode;
  onClickOutside(): void;
};

const downloadFile = async ({
  nexus,
  orgLabel,
  projectLabel,
  resourceId,
  ext,
  title,
}: {
  nexus: NexusClient;
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
    console.log('@@error', error);
  }
};

const PopoverContainer = forwardRef<HTMLDivElement, PopoverContainer>(
  ({ children, onClickOutside }, ref) => {
    const {
      editorPopoverResolvedData: { top, left, resolvedAs },
    } = useSelector((state: RootState) => state.uiSettings);

    useOnClickOutside(
      ref as React.MutableRefObject<HTMLDivElement | null>,
      onClickOutside
    );
    return (
      <div
        ref={ref}
        className={clsx(
          'custom-popover-token',
          resolvedAs === 'error' && 'error'
        )}
        style={{
          top: `${top}px`,
          left: `${left}px`,
        }}
      >
        {children}
      </div>
    );
  }
);

const ResolvedLinkEditorPopover = () => {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useHistory();
  const dispatch = useDispatch();
  const nexus = useNexusContext();
  const { pathname } = useLocation();
  const routeMatch = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    resourceId: string;
  }>(`/:orgLabel/:projectLabel/resources/:resourceId`);
  const {
    editorPopoverResolvedData: { open, error, resolvedAs, results },
  } = useSelector((state: RootState) => state.uiSettings);
  const resultPattern: TResultPattern = { resolvedAs, open };

  const onClickOutside = () => {
    dispatch({
      type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
      payload: editorPopoverResolvedDataInitialValue,
    });
  };
  const onClickLink = async (resource: TDELink) => {
    onClickOutside();
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

  const onDownload = async (data: TDELink) => {
    await downloadFile({
      nexus,
      orgLabel: data.resource?.[0]!,
      projectLabel: data.resource?.[1]!,
      resourceId: data.resource?.[2]!,
      ext: data.resource?.[4] ?? 'json',
      title: data.title,
    });
  };

  return pmatch(resultPattern)
    .with({ open: true, resolvedAs: 'error' }, () => (
      <PopoverContainer {...{ onClickOutside, ref }}>
        <div className="popover-btn error">{error}</div>
      </PopoverContainer>
    ))
    .with({ open: true, resolvedAs: 'resource' }, () => {
      const result = results as TDELink;
      return (
        <PopoverContainer {...{ onClickOutside, ref }}>
          <div className="resource" key={result._self}>
            <Tag color="red">{`${result.resource?.[0]}/${result.resource?.[1]}`}</Tag>
            <button
              onClick={() => onClickLink(result)}
              className="link popover-btn"
            >
              <span>{result.title ?? result.resource?.[2]}</span>
            </button>
            {result.isDownloadable && (
              <div className="popover-download-btn">
                <DownloadOutlined onClick={() => onDownload(result)} />
              </div>
            )}
          </div>
        </PopoverContainer>
      );
    })
    .with({ open: true, resolvedAs: 'resources' }, () => {
      return (
        <PopoverContainer {...{ onClickOutside, ref }}>
          {(results as TDELink[]).map(item => (
            <div className="resource" key={item._self}>
              <Tag color="blue">{`${item.resource?.[0]}/${item.resource?.[1]}`}</Tag>
              <button
                onClick={() => onClickLink(item)}
                className="link popover-btn"
              >
                <span>{item.title ?? item.resource?.[2]}</span>
              </button>
              {item.isDownloadable && (
                <div className="popover-download-btn">
                  <DownloadOutlined onClick={() => onDownload(item)} />
                </div>
              )}
            </div>
          ))}
        </PopoverContainer>
      );
    })
    .with({ open: true, resolvedAs: 'external' }, () => {
      const result = results as TDELink;
      return (
        <PopoverContainer {...{ onClickOutside, ref }}>
          <div className="resource external">
            <Tag color="yellow">External Link</Tag>
            <span>
              This is external Link please configure CrossProjectResolver for
              your project
            </span>
            <button disabled className="link popover-btn">
              <span>{result.title}</span>
            </button>
          </div>
        </PopoverContainer>
      );
    })
    .otherwise(() => <></>);
};

export default ResolvedLinkEditorPopover;
