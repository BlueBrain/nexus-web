import React, { ReactNode, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';
import { clsx } from 'clsx';
import { Tag } from 'antd';
import { match as pmatch } from 'ts-pattern';
import { UISettingsActionTypes } from '../../store/actions/ui-settings';
import { RootState } from '../../store/reducers';
import {
  TDELink,
  InitNewVisitDataExplorerGraphView,
  AddNewNodeDataExplorerGraphFlow,
} from '../../store/reducers/data-explorer';
import { TEditorPopoverResolvedData } from '../../store/reducers/ui-settings';
import { getOrgAndProjectFromProjectId, getResourceLabel } from '../../utils';
import { getNormalizedTypes } from '../../components/ResourceEditor/editorUtils';
import useOnClickOutside from '../../hooks/useClickOutside';
import './styles.less';

type TResultPattern = Pick<TEditorPopoverResolvedData, 'open' | 'resolvedAs'>;

const PopoverContainer = ({
  children,
  onClickOutside,
}: {
  children: ReactNode;
  onClickOutside(): void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const {
    editorPopoverResolvedData: { top, left, resolvedAs },
  } = useSelector((state: RootState) => state.uiSettings);

  useOnClickOutside(ref, onClickOutside);
  return (
    <div
      data-testId="custom-link-popover"
      ref={ref}
      className={clsx(
        'custom-popover-token',
        resolvedAs === 'error' && 'error'
      )}
      style={{ top, left }}
    >
      {children}
    </div>
  );
};

const ResolvedLinkEditorPopover = () => {
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
      payload: {
        open: false,
        top: 0,
        left: 0,
        error: null,
        results: [],
        resolvedAs: undefined,
      },
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

  return pmatch(resultPattern)
    .with({ open: true, resolvedAs: 'error' }, () => (
      <PopoverContainer {...{ onClickOutside }}>
        <div className="popover-btn">{error}</div>
      </PopoverContainer>
    ))
    .with({ open: true, resolvedAs: 'resource' }, () => {
      const result = results as TDELink;
      return (
        <PopoverContainer {...{ onClickOutside }}>
          <div className="resource" key={result._self}>
            {result.resource?.[0] && result.resource?.[1] && (
              <Tag color="blue">{`${result.resource?.[0]}/${result.resource?.[1]}`}</Tag>
            )}
            <button
              onClick={() => onClickLink(result)}
              className="link popover-btn"
            >
              <span>{result.title ?? result.resource?.[2]}</span>
            </button>
          </div>
        </PopoverContainer>
      );
    })
    .with({ open: true, resolvedAs: 'resources' }, () => {
      return (
        <PopoverContainer {...{ onClickOutside }}>
          {(results as TDELink[]).map(item => (
            <div className="resource" key={item._self}>
              {item.resource?.[0] && item.resource?.[1] && (
                <Tag color="blue">{`${item.resource?.[0]}/${item.resource?.[1]}`}</Tag>
              )}
              <button
                onClick={() => onClickLink(item)}
                className="link popover-btn"
              >
                <span>{item.title ?? item.resource?.[2]}</span>
              </button>
            </div>
          ))}
        </PopoverContainer>
      );
    })
    .with({ open: true, resolvedAs: 'external' }, () => {
      const result = results as TDELink;
      return (
        <PopoverContainer {...{ onClickOutside }}>
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
