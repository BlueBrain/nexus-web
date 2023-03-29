import * as React from 'react';
import { Drawer, Modal, Button, Empty } from 'antd';
import { ArrowLeftOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { useHistory, useRouteMatch } from 'react-router';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { ProjectResponseCommon, OrgResponseCommon } from '@bbp/nexus-sdk';
import { useOrganisationsSubappContext } from '..';
import ProjectList from '../containers/ProjectList';
import Skeleton from '../../../shared/components/Skeleton';
import ProjectForm from '../components/Projects/ProjectForm';
import ListItem from '../../../shared/components/List/Item';
import ProjectItem from '../components/Projects/ProjectItem';
import useNotification from '../../../shared/hooks/useNotification';
import QuotasContainer from '../containers/QuotasContainer';
import StoragesContainer from '../containers/StoragesContainer';

const ProjectsView: React.FunctionComponent = () => {
  const notification = useNotification();
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [orgLoadingBusy, setOrgLoadingBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [activeOrg, setActiveOrg] = React.useState<
    OrgResponseCommon | null | undefined
  >(null);
  const [
    selectedProject,
    setSelectedProject,
  ] = React.useState<ProjectResponseCommon | null>(null);

  const nexus = useNexusContext();
  const history = useHistory();
  // const subapp = useAdminSubappContext();
  const subapp = useOrganisationsSubappContext();
  const match = useRouteMatch<{ orgLabel: string }>(
    `/${subapp.namespace}/:orgLabel`
  );
  const goTo = (org: string, project: string) =>
    history.push(`${org}/${project}`);

  React.useEffect(() => {
    if (!match) {
      return;
    }
    if (!activeOrg) {
      loadprojects();
    }
  }, [match?.path, activeOrg]);

  const loadprojects = () => {
    if (match) {
      setOrgLoadingBusy(true);

      nexus.Organization.get(match.params.orgLabel)
        .then((org: OrgResponseCommon) => {
          setOrgLoadingBusy(false);
          setActiveOrg(org);
        })
        .catch((error: Error) => {
          setOrgLoadingBusy(false);
          notification.error({
            message: `Error fetching organization ${match.params.orgLabel}`,
            description: error.message,
          });
        });
    }
  };

  const saveAndCreate = (newProject: ProjectResponseCommon) => {
    setFormBusy(true);
    if (!activeOrg) {
      return;
    }
    nexus.Project.create(activeOrg._label, newProject._label, {
      base: newProject.base || undefined,
      vocab: newProject.vocab || undefined,
      description: newProject.description || '',
      apiMappings: newProject.apiMappings || undefined,
    })
      .then(() => {
        notification.success({
          message: 'Project created',
        });
        setFormBusy(false);
        goTo(activeOrg._label, newProject._label);
      })
      .catch(error => {
        setFormBusy(false);
        notification.error({
          message: 'Error creating project',
          description: error.reason || error.message,
        });
      });
  };

  const saveAndModify = (
    selectedProject: ProjectResponseCommon,
    newProject: ProjectResponseCommon
  ) => {
    setFormBusy(true);
    if (!activeOrg) {
      return;
    }
    nexus.Project.update(
      activeOrg._label,
      newProject._label,
      selectedProject._rev,
      {
        base: newProject.base,
        vocab: newProject.vocab,
        description: newProject.description,
        apiMappings: newProject.apiMappings || [],
      }
    )
      .then(() => {
        notification.success({
          message: 'Project saved',
        });
        setFormBusy(false);
        setModalVisible(false);
        setSelectedProject(null);
        loadprojects();
      })
      .catch((error: Error) => {
        setFormBusy(false);
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
        });
      });
  };

  const saveAndDeprecate = (selectedProject: ProjectResponseCommon) => {
    setFormBusy(true);
    nexus.Project.deprecate(
      selectedProject._organizationLabel,
      selectedProject._label,
      selectedProject._rev
    )
      .then(
        () => {
          notification.success({
            message: 'Project successfully deprecated',
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedProject(null);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Project NOT deprecated',
            description: action?.error?.message,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
        });
      });
  };

  const organisationLabel = activeOrg?.['@id'].split('/').reverse()?.[0];
  const backToAdmin = () => history.push(`/admin`);

  if (orgLoadingBusy) {
    return (
      <Skeleton
        itemNumber={5}
        active
        avatar
        paragraph={{
          rows: 1,
          width: 0,
        }}
        title={{
          width: '100%',
        }}
      />
    );
  }

  return (
    <div className="projects-view view-container">
      {activeOrg ? (
        <div style={{ flexGrow: 1, overflow: 'auto' }}>
          <div>
            <Button
              size="middle"
              type="link"
              onClick={backToAdmin}
              icon={<ArrowLeftOutlined />}
              style={{ padding: 0 }}
            >
              Organizations
            </Button>
            <h1 style={{ marginBottom: 0, marginRight: 8 }}>
              {activeOrg._label ?? organisationLabel}
            </h1>
          </div>
          {activeOrg.description && <p>{activeOrg.description}</p>}
          <div
            style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}
          >
            <h2 style={{ marginBottom: 0, marginRight: 8 }}>Projects</h2>
            <AccessControl
              permissions={['projects/create']}
              path={`/${activeOrg._label}`}
            >
              <Button type="primary" onClick={() => setModalVisible(true)}>
                <PlusSquareOutlined
                  type="plus-square"
                  style={{ fontSize: '16px', color: 'white' }}
                />
                Create Project
              </Button>
            </AccessControl>
          </div>
          <ProjectList orgLabel={activeOrg._label}>
            {({ items }: { items: ProjectResponseCommon[] }) =>
              items.map(i => (
                <ListItem
                  key={i['@id']}
                  onClick={() => goTo(i._organizationLabel, i._label)}
                >
                  <ProjectItem {...i} />
                </ListItem>
              ))
            }
          </ProjectList>
          <Modal
            title="New Project"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            confirmLoading={formBusy}
            footer={null}
            width={600}
          >
            <ProjectForm
              onSubmit={(p: ProjectResponseCommon) => saveAndCreate(p)}
              busy={formBusy}
            />
          </Modal>
          <Drawer
            width={750}
            visible={!!(selectedProject && selectedProject._label)}
            onClose={() => setSelectedProject(null)}
            title={`Project: ${selectedProject && selectedProject._label}`}
          >
            {selectedProject && (
              <>
                <AccessControl
                  key="quotas-access-control"
                  path={`/${selectedProject._organizationLabel}/${selectedProject._label}`}
                  permissions={['quotas/read']}
                >
                  <QuotasContainer
                    orgLabel={selectedProject._organizationLabel}
                    projectLabel={selectedProject._label}
                  />
                  <StoragesContainer
                    orgLabel={selectedProject._organizationLabel}
                    projectLabel={selectedProject._label}
                  />
                </AccessControl>
                <h3>Project Settings</h3>
                <br />
                <ProjectForm
                  project={{
                    _label: selectedProject._label,
                    _rev: selectedProject._rev,
                    description: selectedProject.description || '',
                    base: selectedProject.base,
                    vocab: selectedProject.vocab,
                    apiMappings: selectedProject.apiMappings,
                  }}
                  onSubmit={(p: ProjectResponseCommon) =>
                    saveAndModify(selectedProject, p)
                  }
                  onDeprecate={() => saveAndDeprecate(selectedProject)}
                  busy={formBusy}
                  mode="edit"
                />
              </>
            )}
          </Drawer>
        </div>
      ) : (
        <div style={{ flexGrow: 1, overflow: 'auto' }}>
          <Empty
            description={`No Organization ${match?.params.orgLabel ||
              ''} Found`}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
