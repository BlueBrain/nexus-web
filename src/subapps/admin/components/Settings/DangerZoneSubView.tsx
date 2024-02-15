import React, { useReducer } from 'react';
import { Button, notification, Tooltip, List } from 'antd';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { DeleteOutlined, UndoOutlined, StopOutlined } from '@ant-design/icons';
import { useHistory, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient } from 'react-query';
import { NexusClient } from '@bbp/nexus-sdk/es';
import { makeOrganizationUri } from '../../../../shared/utils';
import { RootState } from '../../../../shared/store/reducers';
import DangerZoneAction, {
  DangerZoneActionProps,
} from '../../../../shared/modals/DangerZone/DangerZoneAction';
import HasNoPermission from '../../../../shared/components/Icons/HasNoPermission';
import './styles.scss';

type TDangerZoneItem = {
  key: React.Key;
  title: string;
  description: string;
  action: React.ReactElement;
};

type DangerZoneActionState = Omit<DangerZoneActionProps, 'onClose' | 'status'>;

type DangerZoneSubViewProps = {
  project: {
    _label: string;
    _rev: number;
    description?: string;
    base?: string;
    vocab?: string;
    mode: string;
    _deprecated: boolean;
  };
};

const deprecateProject = async ({
  nexus,
  orgLabel,
  projectLabel,
  rev,
}: {
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
  rev: number;
}) => {
  try {
    await nexus.Project.deprecate(orgLabel, projectLabel, rev);
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not deprecate your project', { cause: error });
  }
};

const undoDeprecateProject = async ({
  apiEndpoint,
  nexus,
  orgLabel,
  projectLabel,
  rev,
}: {
  apiEndpoint: string;
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
  rev: number;
}) => {
  try {
    await nexus.httpPut({
      path: `${apiEndpoint}/projects/${orgLabel}/${projectLabel}/undeprecate?rev=${rev}`,
    });
  } catch (error) {
    // @ts-ignore
    throw new Error('Cannot undo deprecation of the project', { cause: error });
  }
};

const deleteProject = async ({
  nexus,
  apiEndpoint,
  orgLabel,
  projectLabel,
  rev,
}: {
  nexus: NexusClient;
  apiEndpoint: string;
  orgLabel: string;
  projectLabel: string;
  rev: number;
}) => {
  try {
    await nexus.httpDelete({
      path: `${apiEndpoint}/projects/${orgLabel}/${projectLabel}?rev=${rev}&prune=true`,
    });
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not delete your project', { cause: error });
  }
};

const DangerZoneSubView = ({ project }: DangerZoneSubViewProps) => {
  const queryClient = useQueryClient();
  const nexus = useNexusContext();
  const history = useHistory();
  const apiEndpoint = useSelector(
    (state: RootState) => state.config.apiEndpoint
  );

  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();

  const {
    params: { orgLabel, projectLabel },
  } = match;
  const [
    { open, matchTerm, title, description, action, handler },
    updateModalState,
  ] = useReducer(
    (
      previous: DangerZoneActionState,
      nextState: Partial<DangerZoneActionState>
    ) => ({
      ...previous,
      ...nextState,
    }),
    {
      open: false,
      matchTerm: `${orgLabel}/${projectLabel}`.toLowerCase(),
      title: '',
      description: '',
      action: 'deprecate',
      handler: () => {},
    }
  );
  const onClose = () => updateModalState({ open: false });

  const { mutateAsync: deprecateProjectAsync, status } = useMutation(
    deprecateProject,
    {
      onSuccess: () => {
        history.push(makeOrganizationUri(orgLabel));
        notification.success({
          message: <strong>{`Project ${orgLabel}/${projectLabel}`}</strong>,
          description: 'Project has been deprecated successfully',
        });
      },
      onError: error => {
        notification.error({
          message: `Error deprecating project ${projectLabel}`,
          // @ts-ignore
          description: <code>{error.cause.message}</code>,
        });
      },
    }
  );

  const {
    mutateAsync: undoDeprecateProjectAsync,
    status: undoDeprecationStatus,
  } = useMutation(
    () =>
      undoDeprecateProject({
        apiEndpoint,
        nexus,
        orgLabel,
        projectLabel,
        rev: project._rev,
      }),
    {
      onSuccess: () => {
        // Invalidate project query to refetch the project to update the UI
        queryClient.invalidateQueries(['project', orgLabel, projectLabel]);

        notification.success({
          message: <strong>{`Project ${orgLabel}/${projectLabel}`}</strong>,
          description: 'Project deprecation has been undone successfully',
        });
      },
      onError: (error: any) => {
        notification.error({
          message: `Error undoing deprecation of project ${projectLabel}`,
          description: (
            <code>
              {error && error.cause ? error.cause.message : 'An error occurred'}
            </code>
          ),
        });
      },
    }
  );

  const {
    mutateAsync: deleteProjectAsync,
    status: deletionStatus,
  } = useMutation(deleteProject, {
    onSuccess: () => {
      history.push(makeOrganizationUri(orgLabel));
      notification.success({
        message: <strong>{`Project ${orgLabel}/${projectLabel}`}</strong>,
        description: 'Project has been deleted successfully',
      });
    },
    onError: error => {
      notification.error({
        message: `Error deleting project ${projectLabel}`,
        // @ts-ignore
        description: <code>{error.cause.reason}</code>,
      });
    },
  });

  const handleDeprecation = () =>
    deprecateProjectAsync({ nexus, orgLabel, projectLabel, rev: project._rev });

  const handleUndoDeprecation = () => {
    undoDeprecateProjectAsync();
  };

  const handleDeletion = () =>
    deleteProjectAsync({
      nexus,
      apiEndpoint,
      orgLabel,
      projectLabel,
      rev: project._rev,
    });

  const handleOpenDeprecationModal = () =>
    updateModalState({
      open: true,
      title: 'Deprecate Project',
      description:
        'Deprecating a project will make it read-only. You will not be able to create new resources in this project',
      action: 'deprecate',
      handler: handleDeprecation,
    });

  const handleOpenDeleteModal = () =>
    updateModalState({
      open: true,
      title: 'Delete Project',
      description: 'This action cannot be undone. This will permanently delete',
      action: 'delete',
      handler: handleDeletion,
    });

  const dangerZoneDataSource: TDangerZoneItem[] = [
    {
      key: 'deprecation-action-section',
      title: project._deprecated
        ? 'Undo Deprecation of this project'
        : 'Deprecate this project',
      description: project._deprecated
        ? 'Restore this project to its active state.'
        : 'Mark this project as deprecated and read-only.',
      action: (
        <AccessControl
          path={[`${orgLabel}/${projectLabel}`]}
          permissions={['projects/write']}
          noAccessComponent={() => (
            <Tooltip
              title={`You have no permissions to ${
                project._deprecated ? 'undo the deprecation of' : 'deprecate'
              } this project`}
            >
              <Button disabled danger style={{ margin: 0, marginRight: 10 }}>
                <span>
                  {project._deprecated
                    ? 'Undo Deprecation'
                    : 'Deprecate this Project'}
                </span>
                <HasNoPermission />
              </Button>
            </Tooltip>
          )}
        >
          <Button
            danger={!project._deprecated}
            type={project._deprecated ? 'primary' : 'ghost'}
            htmlType="button"
            disabled={
              project._deprecated && undoDeprecationStatus === 'loading'
            }
            loading={
              project._deprecated
                ? undoDeprecationStatus === 'loading'
                : status === 'loading'
            }
            onClick={
              project._deprecated
                ? handleUndoDeprecation
                : handleOpenDeprecationModal
            }
            style={{ margin: 0, marginRight: 10 }}
          >
            {project._deprecated ? <UndoOutlined /> : <StopOutlined />}
            {project._deprecated
              ? 'Undo Deprecation'
              : 'Deprecate this Project'}
          </Button>
        </AccessControl>
      ),
    },
    {
      key: 'delete-project-section',
      title: 'Delete this project',
      description:
        'Once you delete a project, there is no going back. Please be certain. ',
      action: (
        <AccessControl
          path={[`${orgLabel}/${projectLabel}`]}
          permissions={['projects/delete']}
          noAccessComponent={() => (
            <Tooltip title="You have no permissions to delete this project">
              <Button disabled danger style={{ margin: 0, marginRight: 10 }}>
                <span>Delete this Project</span>
                <HasNoPermission />
              </Button>
            </Tooltip>
          )}
        >
          <Button
            danger
            style={{ margin: 0, marginRight: 10 }}
            type="primary"
            htmlType="button"
            onClick={handleOpenDeleteModal}
          >
            <DeleteOutlined />
            Delete this Project
          </Button>
        </AccessControl>
      ),
    },
  ];

  return (
    <>
      <div className="settings-view settings-danger-zone-view">
        <h2>Danger Zone</h2>
        <div className="settings-view-container">
          <div className="danger-actions">
            <List<TDangerZoneItem>
              size="large"
              bordered
              className="danger-zone-container"
              rowKey={item => item.key}
              dataSource={dangerZoneDataSource}
              renderItem={item => {
                return (
                  <List.Item key={item.key} extra={item.action}>
                    <List.Item.Meta
                      className="danger-zone-item"
                      title={<div className="title">{item.title}</div>}
                      description={item.description}
                    />
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      </div>
      <DangerZoneAction
        {...{ open, matchTerm, title, description, action, handler }}
        status={status === 'loading' || deletionStatus === 'loading'}
        onClose={onClose}
      />
    </>
  );
};

export default DangerZoneSubView;
