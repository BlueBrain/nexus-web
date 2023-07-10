import React, { ReactNode, useRef, forwardRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useMutation } from 'react-query';
import { clsx } from 'clsx';
import { Tag, notification } from 'antd';
import * as Sentry from '@sentry/browser';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { RootState } from '../../store/reducers';
import { TDELink } from '../../store/reducers/data-explorer';
import { TEditorPopoverResolvedData } from '../../store/reducers/ui-settings';
import useOnClickOutside from '../../hooks/useClickOutside';
import useResolvedLinkEditorPopover from './useResolvedLinkEditorPopover';
import './styles.less';

type TResultPattern = Pick<TEditorPopoverResolvedData, 'open' | 'resolvedAs'>;
type PopoverContainer = {
  children: ReactNode;
  onClickOutside(): void;
};

const DownloadResourceButton = ({
  downloadInProgress,
  downloadBinaryAsync,
}: {
  downloadInProgress: boolean;
  downloadBinaryAsync: () => Promise<void>;
}) => {
  return (
    <div className="popover-download-btn">
      {downloadInProgress ? (
        <LoadingOutlined spin />
      ) : (
        <DownloadOutlined onClick={downloadBinaryAsync} />
      )}
    </div>
  );
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
        style={{ top, left }}
      >
        {children}
      </div>
    );
  }
);

const ResolvedLinkEditorPopover = () => {
  const ref = useRef<HTMLDivElement>(null);
  const {
    clickOutsideHandler,
    navigateResourceHandler,
    downloadBinaryAsyncHandler,
  } = useResolvedLinkEditorPopover();

  const {
    editorPopoverResolvedData: { open, error, resolvedAs, results },
  } = useSelector((state: RootState) => state.uiSettings);

  const {
    mutateAsync: downloadBinaryAsync,
    isLoading: downloadInProgress,
  } = useMutation({
    mutationKey: 'downloadBinary',
    mutationFn: downloadBinaryAsyncHandler,
    onError: error => {
      notification.error({
        message: 'Download error',
        description: 'Something went wrong while downloading the resource.',
      });
      Sentry.captureException({
        error,
        message: 'Download Binary error',
      });
    },
  });

  if (resolvedAs === 'resources' && open) {
    return (
      <PopoverContainer ref={ref} onClickOutside={clickOutsideHandler}>
        {(results as TDELink[]).map(item => (
          <div className="resource list-item" key={item._self}>
            {item.resource?.[0] && item.resource?.[1] && (
              <Tag color="blue">{`${item.resource?.[0]}/${item.resource?.[1]}`}</Tag>
            )}
            <button
              onClick={() => navigateResourceHandler(item)}
              className="link popover-btn"
            >
              <span>{item.title ?? item.resource?.[2]}</span>
            </button>
            {item.isDownloadable && (
              <DownloadResourceButton
                downloadInProgress={downloadInProgress}
                downloadBinaryAsync={() =>
                  downloadBinaryAsync({
                    orgLabel: item.resource?.[0]!,
                    projectLabel: item.resource?.[1]!,
                    resourceId: item.resource?.[2]!,
                    ext: item.resource?.[4] ?? 'json',
                    title: item.title,
                  })
                }
              />
            )}
          </div>
        ))}
      </PopoverContainer>
    );
  }
  return null;
};

export default ResolvedLinkEditorPopover;
