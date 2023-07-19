import * as React from 'react';
import CodeMirror from 'codemirror';
import clsx from 'clsx';
import { useNexusContext } from '@bbp/react-nexus';
import { useSelector } from 'react-redux';
import {
  TEditorPopoverResolvedData,
  editorLinkResolutionHandler,
  getTokenAndPosAt,
  mayBeResolvableLink,
} from './editorUtils';
import { TDELink } from '../../store/reducers/data-explorer';
import { RootState } from '../../store/reducers';
import useResolutionActions from './useResolutionActions';

const downloadImg = require('../../images/DownloadingLoop.svg');

export const CODEMIRROR_HOVER_CLASS = 'CodeMirror-hover-tooltip';
export const CODEMIRROR_LINK_CLASS = 'fusion-resource-link';
type TTooltipCreator = Pick<
  TEditorPopoverResolvedData,
  'error' | 'resolvedAs' | 'results'
>;

function removePopoversFromDOM() {
  const popovers = document.querySelectorAll(
    `.${CODEMIRROR_HOVER_CLASS}-popover`
  );
  popovers.forEach(popover => popover.remove());
}
function removeTooltipsFromDOM() {
  const tooltips = document.getElementsByClassName(CODEMIRROR_HOVER_CLASS);
  tooltips &&
    Array.from(tooltips).forEach(tooltip => {
      tooltip.remove();
    });
}

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
  if (isDownloadable) {
    const nodeDownload = document.createElement('img');
    nodeDownload.setAttribute('src', downloadImg);
    nodeDownload.classList.add('download-icon');
    tooltipItemContent.appendChild(nodeDownload);
    const keyBinding = document.createElement('span');
    keyBinding.className = 'key-binding';
    // the user has to click and press option key on mac or alt key on windows
    const userAgent = navigator.userAgent;
    const isMac = userAgent.indexOf('Mac') !== -1;
    keyBinding.appendChild(
      document.createTextNode(isMac ? '⌥ + Click' : 'Alt + Click')
    );
    tooltipItemContent.appendChild(keyBinding);
  }
  return tooltipItemContent;
}
function createTooltipContent({ resolvedAs, error, results }: TTooltipCreator) {
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

function createPopoverContent({
  results,
  onClick,
}: {
  results: TDELink[];
  onClick: (result: TDELink) => void;
}) {
  const tooltipContent = document.createElement('div');
  tooltipContent.className = clsx(
    `${CODEMIRROR_HOVER_CLASS}-resources-content`
  );
  // create node for each link in results and then append it to the tooltipContent
  (results as TDELink[]).forEach((link: TDELink) => {
    const linkNode = createTooltipNode({
      tag: link.resource ? `${link.resource?.[0]}/${link.resource?.[1]}` : null,
      title: link.title ?? link._self,
      isDownloadable: link.isDownloadable,
    });
    linkNode.onclick = () => {
      removePopoversFromDOM();
      onClick(link);
    };
    return tooltipContent.appendChild(linkNode);
  });
  return tooltipContent;
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
  } = useSelector((state: RootState) => ({
    config: state.config,
  }));

  const allowTooltip = !isEditing;

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

    function hideTooltip(tooltip: HTMLDivElement) {
      if (!tooltip.parentNode) {
        return;
      }
      tooltip.parentNode.removeChild(tooltip);
    }
    function showTooltip(content: HTMLDivElement, node: HTMLElement) {
      const tooltip = document.createElement('div');
      tooltip.className = CODEMIRROR_HOVER_CLASS;
      tooltip.appendChild(content);
      document.body.appendChild(tooltip);

      function cleanup() {
        if (tooltip) {
          node.classList.remove('has-tooltip');
          hideTooltip(tooltip);
          tooltip.remove();
        }
        node.removeEventListener('mouseout', cleanup);
        node.removeEventListener('click', cleanup);
        node.removeEventListener('scroll', cleanup);
      }

      node.addEventListener('mouseout', cleanup);
      node.addEventListener('click', cleanup);
      node.addEventListener('scroll', cleanup);

      const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
        if (tooltip) {
          hideTooltip(tooltip);
          tooltip.remove();
        }
        return clearTimeout(timeoutId);
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
          removeTooltipsFromDOM();
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
    // allow the tooltip only when the editor is not in edition mode
    // and the popover is not open
    allowTooltip && editorWrapper.addEventListener('mouseover', onMouseOver);
    // remove the event listener when not allwoed
    !allowTooltip &&
      editorWrapper.removeEventListener('mouseover', onMouseOver);

    // cleanup
    // remove the event listener when the component is unmounted
    return () => {
      allowTooltip &&
        editorWrapper.removeEventListener('mouseover', onMouseOver);
    };
  }, [
    (ref as React.MutableRefObject<CodeMirror.Editor>)?.current,
    allowTooltip,
  ]);
}

function useEditorPopover({
  ref,
  orgLabel,
  projectLabel,
}: {
  ref: React.MutableRefObject<CodeMirror.Editor | undefined>;
  orgLabel: string;
  projectLabel: string;
}) {
  const nexus = useNexusContext();
  const {
    navigateResourceHandler,
    downloadBinaryAsyncHandler,
  } = useResolutionActions();
  const {
    config: { apiEndpoint },
  } = useSelector((state: RootState) => ({
    config: state.config,
  }));

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
    function showTooltip(content: HTMLDivElement, node: HTMLElement) {
      const tooltip = document.createElement('div');
      tooltip.className = `${CODEMIRROR_HOVER_CLASS}-popover popover`;
      tooltip.appendChild(content);
      document.body.appendChild(tooltip);
      return tooltip;
    }
    function onEditorMouseDown(ev: MouseEvent, node: HTMLElement) {
      if (
        ev.target &&
        !node.contains(ev.target as HTMLElement) &&
        !(ev.target as HTMLElement).isEqualNode(node) &&
        (ev.target as HTMLElement).closest('.CodeMirror-wrap')
      ) {
        removePopoversFromDOM();
      }
      editorWrapper.removeEventListener('mousedown', (ev: MouseEvent) =>
        onEditorMouseDown(ev, node)
      );
    }
    async function onMouseDown(_: CodeMirror.Editor, ev: MouseEvent) {
      removeTooltipsFromDOM();
      const node = ev.target as HTMLElement;
      if (node) {
        const { token } = getTokenAndPosAt(ev, currentEditor);
        const content = token?.string || '';
        const url = content.replace(/\\/g, '').replace(/\"/g, '');
        if (url && mayBeResolvableLink(url)) {
          editorLinkResolutionHandler({
            nexus,
            apiEndpoint,
            url,
            orgLabel,
            projectLabel,
          }).then(({ resolvedAs, results }) => {
            switch (resolvedAs) {
              case 'resources': {
                const tooltipContent = createPopoverContent({
                  results: results as TDELink[],
                  onClick: navigateResourceHandler,
                });
                if (tooltipContent) {
                  const tooltip = showTooltip(tooltipContent, node);
                  positionner(ev, tooltip);
                  editorWrapper.addEventListener(
                    'mousedown',
                    (ev: MouseEvent) => onEditorMouseDown(ev, node)
                  );
                }
                break;
              }
              case 'resource': {
                const result = results as TDELink;
                // this alt for windows, and option for mac
                const optionClick = ev.altKey;
                if (result.isDownloadable && optionClick) {
                  return downloadBinaryAsyncHandler({
                    orgLabel: result.resource?.[0]!,
                    projectLabel: result.resource?.[1]!,
                    resourceId: result.resource?.[2]!,
                    ext: result.resource?.[4] ?? 'json',
                    title: result.title,
                  });
                }
                return navigateResourceHandler(result);
              }
              case 'external': {
                window.open(
                  (results as TDELink)._self,
                  '_blank',
                  'noopener noreferrer'
                );
                break;
              }
              case 'error':
              default:
                break;
            }
            return;
          });
        }
      }
    }
    currentEditor.on('mousedown', onMouseDown);
    return () => {
      currentEditor.off('mousedown', onMouseDown);
    };
  }, [
    (ref as React.MutableRefObject<CodeMirror.Editor>)?.current,
    navigateResourceHandler,
  ]);
}

export { useEditorPopover, useEditorTooltip };
