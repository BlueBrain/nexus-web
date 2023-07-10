import * as React from 'react';
import CodeMirror from 'codemirror';
import clsx from 'clsx';
import { useNexusContext } from '@bbp/react-nexus';
import { useSelector } from 'react-redux';
import {
  editorLinkResolutionHandler,
  getTokenAndPosAt,
  mayBeResolvableLink,
} from './editorUtils';
import { TDELink } from '../../store/reducers/data-explorer';
import { TEditorPopoverResolvedData } from '../../store/reducers/ui-settings';
import { RootState } from '../../store/reducers';

const downloadImg = require('../../images/DownloadingLoop.svg');
export const CODEMIRROR_HOVER_CLASS = 'CodeMirror-hover-tooltip';
export const CODEMIRROR_LINK_CLASS = 'fusion-resource-link';

function createTooltipNode({
  tag,
  title,
  isDownloadable,
}: {
  tag: string | null;
  title: string;
  isDownloadable?: boolean;
}) {
  const tooltipItemContent = document.createElement('div');
  tooltipItemContent.className = 'CodeMirror-hover-tooltip-item';
  const nodeTag = document.createElement('div');
  nodeTag.className = 'tag';
  tag && nodeTag.appendChild(document.createTextNode(tag));
  tooltipItemContent.appendChild(nodeTag);

  const nodeTitle = document.createElement('span');
  nodeTitle.className = 'title';
  nodeTitle.appendChild(document.createTextNode(title));
  tooltipItemContent.appendChild(nodeTitle);

  const nodeDownload = isDownloadable && document.createElement('img');
  nodeDownload && nodeDownload.setAttribute('src', downloadImg);
  nodeDownload && nodeDownload.classList.add('download-icon');
  nodeDownload && tooltipItemContent.appendChild(nodeDownload);

  return tooltipItemContent;
}
function createTooltipContent({
  resolvedAs,
  error,
  results,
}: Pick<TEditorPopoverResolvedData, 'error' | 'resolvedAs' | 'results'>) {
  const tooltipContent = document.createElement('div');
  tooltipContent.className = clsx(
    `${CODEMIRROR_HOVER_CLASS}-content`,
    resolvedAs && resolvedAs
  );
  if (resolvedAs === 'error' && error) {
    tooltipContent.appendChild(
      createTooltipNode({
        tag: 'Error',
        title: error,
      })
    );
    return tooltipContent;
  }
  if (resolvedAs === 'resource') {
    const result = results as TDELink;
    tooltipContent.appendChild(
      createTooltipNode({
        tag: result.resource
          ? `${result.resource?.[0]}/${result.resource?.[1]}`
          : null,
        title: result.title ?? result._self,
        isDownloadable: result.isDownloadable,
      })
    );
    return tooltipContent;
  }
  if (resolvedAs === 'resources') {
    tooltipContent.appendChild(
      createTooltipNode({
        tag: 'Multiple',
        title: `${
          (results as TDELink[]).length
        } resources was found, click to list them`,
      })
    );
    return tooltipContent;
  }
  if (resolvedAs === 'external') {
    tooltipContent.appendChild(
      createTooltipNode({
        tag: 'External',
        title: (results as TDELink).title ?? (results as TDELink)._self,
      })
    );
    return tooltipContent;
  }
  return null;
}

function useEditorTooltip({
  ref,
  isEditing,
  orgLabel,
  projectLabel,
}: {
  ref: React.MutableRefObject<CodeMirror.Editor | undefined>;
  isEditing: boolean;
  orgLabel: string;
  projectLabel: string;
}) {
  const nexus = useNexusContext();
  const {
    config: { apiEndpoint },
    ui: {
      editorPopoverResolvedData: { open: isPopoverOpen },
    },
  } = useSelector((state: RootState) => ({
    dataExplorer: state.dataExplorer,
    config: state.config,
    ui: state.uiSettings,
  }));

  const allowTooltip = !isEditing && !isPopoverOpen;

  React.useEffect(() => {
    const currentEditor = (ref as React.MutableRefObject<CodeMirror.Editor>)
      ?.current;
    const editorWrapper = currentEditor.getWrapperElement();
    function positionner(ev: MouseEvent, tooltip: HTMLDivElement) {
      const editorRect = (ev.target as HTMLElement).getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      if (tooltipRect.height <= editorRect.top) {
        tooltip.style.top = `${editorRect.top - tooltipRect.height}px`;
      } else {
        tooltip.style.top = `${editorRect.bottom}px`;
      }
      tooltip.style.left = `${editorRect.left}px`;
    }
    function removeTooltipFromDom(tooltip: HTMLDivElement) {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }
    function hideTooltip(tooltip: HTMLDivElement) {
      if (!tooltip.parentNode) {
        return;
      }
      setTimeout(() => {
        removeTooltipFromDom(tooltip);
      }, 300);
    }
    function showTooltip(content: HTMLDivElement, node: HTMLElement) {
      const tooltip = document.createElement('div');
      tooltip.className = CODEMIRROR_HOVER_CLASS;
      tooltip.appendChild(content);
      document.body.appendChild(tooltip);

      function hide() {
        if (tooltip) {
          node.classList.remove('has-tooltip');
          hideTooltip(tooltip);
          tooltip.remove();
        }
        node.removeEventListener('mouseout', hide);
        node.removeEventListener('click', hide);
      }

      node.addEventListener('mouseout', hide);
      node.addEventListener('click', hide);

      const pool: ReturnType<typeof setTimeout> = setTimeout(() => {
        if (tooltip) {
          hideTooltip(tooltip);
          tooltip.remove();
        }
        return clearTimeout(pool);
      }, 3000);

      return tooltip;
    }

    async function onMouseOver(ev: MouseEvent) {
      const node = ev.target as HTMLElement;
      if (node) {
        const { token } = getTokenAndPosAt(ev, currentEditor);
        const content = token?.string || '';
        const url = content.replace(/\\/g, '').replace(/\"/g, '');
        if (url && mayBeResolvableLink(url)) {
          node.classList.add('wait-for-tooltip');
          const tooltips = document.getElementsByClassName(
            CODEMIRROR_HOVER_CLASS
          );
          tooltips &&
            Array.from(tooltips).forEach(tooltip => {
              tooltip.remove();
            });
          editorLinkResolutionHandler({
            nexus,
            apiEndpoint,
            url,
            orgLabel,
            projectLabel,
          }).then(({ resolvedAs, results, error }) => {
            const tooltipContent = createTooltipContent({
              resolvedAs,
              error,
              results,
            });
            if (tooltipContent) {
              node.classList.remove('wait-for-tooltip');
              node.classList.add(
                resolvedAs === 'error'
                  ? 'error'
                  : resolvedAs === 'resource' &&
                    (results as TDELink).isDownloadable
                  ? 'downloadable'
                  : 'has-tooltip'
              );
              const tooltip = showTooltip(tooltipContent, node);
              const calculatePosition = (ev: MouseEvent) =>
                positionner(ev, tooltip);
              editorWrapper.addEventListener('mousemove', calculatePosition);
            }
          });
        }
      }
    }
    allowTooltip && editorWrapper.addEventListener('mouseover', onMouseOver);
    !allowTooltip &&
      editorWrapper.removeEventListener('mouseover', onMouseOver);
    return () => {
      allowTooltip &&
        editorWrapper.removeEventListener('mouseover', onMouseOver);
    };
  }, [
    (ref as React.MutableRefObject<CodeMirror.Editor>)?.current,
    allowTooltip,
  ]);
}

export default useEditorTooltip;
