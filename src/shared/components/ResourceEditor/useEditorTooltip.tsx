import React from 'react';
import CodeMirror from 'codemirror';
import clsx from 'clsx';
import { useNexusContext } from '@bbp/react-nexus';
import { useSelector } from 'react-redux';
import pluralize from 'pluralize';
import {
  CODEMIRROR_COPY_URL_CLASS,
  CODEMIRROR_HOVER_CLASS,
  TEditorPopoverResolvedData,
  editorLinkResolutionHandler,
  getTokenAndPosAt,
  mayBeResolvableLink,
} from './editorUtils';
import { TDELink } from '../../store/reducers/data-explorer';
import { RootState } from '../../store/reducers';
import useResolutionActions from './useResolutionActions';
import { triggerCopy } from '../../utils/copy';

import downloadImg from '../../images/DownloadingLoop.svg';
import infoImg from '../../images/InfoCircleLine.svg';
import copyImg from '../../images/copyColor.svg';
import copyConfirmedImage from '../../images/confirmAnimated.svg';

type TTooltipCreator = Pick<
  TEditorPopoverResolvedData,
  'error' | 'resolvedAs' | 'results' | 'resolver'
> & {
  onDownload?: () => void;
};

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
function removeAllCopyFromDOM() {
  const copiesBtn = document.getElementsByClassName(CODEMIRROR_COPY_URL_CLASS);
  copiesBtn &&
    Array.from(copiesBtn).forEach(btn => {
      btn.remove();
    });
}

function createCopyButton(url: string) {
  const copyBtn = document.createElement('div');
  const img = copyBtn.appendChild(document.createElement('img'));
  const copied = copyBtn.appendChild(document.createElement('span'));
  copyBtn.className = CODEMIRROR_COPY_URL_CLASS;
  img.className = 'url-copy-icon';

  img.src = copyImg;
  copyBtn.onclick = () => {
    triggerCopy(url);
    img.src = copyConfirmedImage;
    copied.innerText = 'copied to clipboard';
    copied.className = 'copied';
    copyBtn.classList.add('copied');
    const timeoutId = setTimeout(() => {
      copyBtn.remove();
      clearTimeout(timeoutId);
    }, 1000);
  };
  return copyBtn;
}
function createTooltipNode({
  tag,
  title,
  isDownloadable,
  onDownload,
}: {
  tag: string | null;
  title: string;
  isDownloadable?: boolean;
  onDownload?: (ev: MouseEvent) => void;
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
    nodeDownload.onclick = onDownload ?? null;
    const keyBinding = document.createElement('span');
    keyBinding.className = 'key-binding';
    // the user has to click and press option key on mac or alt key on windows
    const userAgent = navigator.userAgent;
    const isMac = userAgent.indexOf('Mac') !== -1;
    const kbdOption = document.createElement('kbd');
    kbdOption.innerText = isMac ? '⌥' : 'Alt';
    const plus = document.createElement('span');
    plus.innerText = ' + ';
    const kbdClick = document.createElement('kbd');
    kbdClick.innerText = 'Click';
    keyBinding.appendChild(kbdOption);
    keyBinding.appendChild(plus);
    keyBinding.appendChild(kbdClick);
    tooltipItemContent.appendChild(nodeDownload);
    tooltipItemContent.appendChild(keyBinding);
  }
  return tooltipItemContent;
}

function createWarningHeader(count: number) {
  const warningHeader = document.createElement('div');
  warningHeader.className = 'CodeMirror-hover-tooltip-warning';
  const warningText = document.createElement('div');
  warningText.className = 'warning-text';
  warningText.appendChild(
    document.createTextNode(
      `We could not resolve this ID to an existing resource as configured in your project, you might need to create this resource or update the resolver configuration of this project.`
    )
  );
  const warningInfo = document.createElement('div');
  warningInfo.className = 'warning-info';
  const warningInfoIcon = document.createElement('img');
  warningInfoIcon.className = 'warning-info-icon';
  warningInfoIcon.setAttribute('src', infoImg);
  warningInfo.appendChild(warningInfoIcon);
  warningInfo.appendChild(
    document.createTextNode(
      `For your information, searching across all projects where you have read access, we found the following matching ${pluralize(
        'resource',
        count
      )}:`
    )
  );
  warningHeader.appendChild(warningText);
  warningHeader.appendChild(warningInfo);
  return warningHeader;
}
function createTooltipContent({
  resolvedAs,
  error,
  results,
  onDownload,
  resolver,
}: TTooltipCreator) {
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
    if (resolver === 'search-api') {
      const warningHeader = createWarningHeader(1);
      tooltipContent.appendChild(warningHeader);
    }
    tooltipContent.appendChild(
      createTooltipNode({
        onDownload,
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
    const warningHeader = createWarningHeader((results as TDELink[]).length);
    tooltipContent.appendChild(warningHeader);
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
  const { downloadBinaryAsyncHandler } = useResolutionActions();
  const {
    config: { apiEndpoint },
  } = useSelector((state: RootState) => ({
    config: state.config,
  }));

  const allowTooltip = !isEditing;

  React.useEffect(() => {
    const currentEditor = (ref as React.MutableRefObject<CodeMirror.Editor>)
      ?.current;
    const editorWrapper = currentEditor && currentEditor.getWrapperElement();

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
        node.removeEventListener('click', cleanup);
        editorWrapper.removeEventListener('scroll', cleanup);
      }

      node.addEventListener('click', cleanup);
      editorWrapper.addEventListener('scroll', cleanup);

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
      if (node && !node.classList.contains('cm-property')) {
        const { url, pos } = getTokenAndPosAt(ev, currentEditor);
        if (url && mayBeResolvableLink(url)) {
          removeAllCopyFromDOM();
          removeTooltipsFromDOM();
          node.classList.add('wait-for-tooltip');
          const copyBtn = createCopyButton(url);
          currentEditor.addWidget(pos!, copyBtn, false);
          editorLinkResolutionHandler({
            nexus,
            apiEndpoint,
            url,
            orgLabel,
            projectLabel,
          }).then(({ resolvedAs, results, error, resolver }) => {
            const tooltipContent = createTooltipContent({
              resolvedAs,
              error,
              results,
              resolver,
              onDownload:
                resolvedAs === 'resource' && (results as TDELink).isDownloadable
                  ? () => {
                      const result = results as TDELink;
                      if (result.isDownloadable) {
                        return downloadBinaryAsyncHandler({
                          orgLabel: result.resource?.[0]!,
                          projectLabel: result.resource?.[1]!,
                          resourceId: result.resource?.[2]!,
                          ext: result.resource?.[4] ?? 'json',
                          title: result.title,
                        });
                      }
                      return;
                    }
                  : undefined,
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
    allowTooltip && editorWrapper && editorWrapper.addEventListener('mouseover', onMouseOver);
    // remove the event listener when not allwoed
    !allowTooltip && editorWrapper &&
      editorWrapper.removeEventListener('mouseover', onMouseOver);

    // cleanup
    // remove the event listener when the component is unmounted
    return () => {
      allowTooltip && editorWrapper &&
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
    const editorWrapper = currentEditor && currentEditor.getWrapperElement();
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
      if (node && !node.classList.contains('cm-property')) {
        const { url } = getTokenAndPosAt(ev, currentEditor);
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
    currentEditor && currentEditor.on('mousedown', onMouseDown);
    return () => {
      currentEditor && currentEditor.off('mousedown', onMouseDown);
    };
  }, [
    (ref as React.MutableRefObject<CodeMirror.Editor>)?.current,
    navigateResourceHandler,
  ]);
}

export { useEditorPopover, useEditorTooltip };
