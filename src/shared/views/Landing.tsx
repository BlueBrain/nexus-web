import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { AccessControl } from '@bbp/react-nexus';
import { Organization, PaginatedList, Project } from '@bbp/nexus-sdk-legacy';
import { RootState } from '../store/reducers';
import { createOrg, modifyOrg, deprecateOrg } from '../store/actions/orgs';
import OrgList from '../components/Orgs/OrgList';
import { Button, Modal, Drawer, notification, Empty } from 'antd';
import OrgForm from '../components/Orgs/OrgForm';
import { CreateOrgPayload } from '@bbp/nexus-sdk-legacy/lib/Organization/types';
import RecentlyVisited from '../components/RecentlyVisited';
import { OrgResponseCommon } from '@bbp/nexus-sdk';

interface LandingProps {
  paginatedOrgs?: PaginatedList<Organization>;
  displayPerPage: number;
  goTo(orgLabel: string): void;
  goToProject(Project: Project): void;
  createOrg: (
    orgLabel: string,
    orgPayload: CreateOrgPayload
  ) => Promise<Organization>;
  modifyOrg: (
    orgLabel: string,
    rev: number,
    orgPayload: CreateOrgPayload
  ) => Promise<Organization>;
  deprecateOrg: (orgLabel: string, rev: number) => Promise<void>;
}

const Landing: React.FunctionComponent<LandingProps> = ({
  paginatedOrgs = { total: 0, index: 0, results: [] },
  goTo,
  createOrg,
  modifyOrg,
  deprecateOrg,
  displayPerPage,
  goToProject,
}) => {
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedOrg, setSelectedOrg] = React.useState<
    OrgResponseCommon | undefined
  >(undefined);

  const saveAndCreate = (newOrg: Organization) => {
    setFormBusy(true);
    createOrg(newOrg.label, { description: newOrg.description || '' })
      .then(
        () => {
          notification.success({
            message: 'Organization created',
            duration: 5,
          });
          setFormBusy(false);
          goTo(newOrg.label);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Organization NOT created',
            description: action.error.message,
            duration: 10,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
      });
  };

  const saveAndModify = (
    selectedOrg: OrgResponseCommon,
    newOrg: Organization
  ) => {
    setFormBusy(true);
    modifyOrg(newOrg.label, selectedOrg._rev, {
      description: newOrg.description,
    })
      .then(
        () => {
          notification.success({
            message: 'Organization saved',
            duration: 2,
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedOrg(undefined);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Organization NOT saved',
            description: action.error.message,
            duration: 2,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
      });
  };

  const saveAndDeprecate = (selectedOrg: OrgResponseCommon) => {
    setFormBusy(true);

    deprecateOrg(selectedOrg._label, selectedOrg._rev)
      .then(
        () => {
          notification.success({
            message: 'Organization deprecated',
            duration: 2,
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedOrg(undefined);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Organization NOT deprecated',
            description: action.error.message,
            duration: 2,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
      });
  };

  return (
    <div className="orgs-view view-container">
      <RecentlyVisited visitProject={goToProject} />
      <div style={{ flexGrow: 1 }}>
        <div
          style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}
        >
          <h1 style={{ marginBottom: 0, marginRight: 8 }}>Organizations</h1>
          <AccessControl permissions={['organizations/create']} path="/">
            <Button
              type="primary"
              onClick={() => setModalVisible(true)}
              icon="plus-square"
            >
              Create Organization
            </Button>
          </AccessControl>
        </div>

        <OrgList
          pageSize={displayPerPage}
          onOrgClick={org => goTo(org._label)}
          onOrgEdit={org => setSelectedOrg(org)}
        />

        <Modal
          title="New Organization"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          confirmLoading={formBusy}
          footer={null}
        >
          <OrgForm
            onSubmit={(o: Organization) => saveAndCreate(o)}
            busy={formBusy}
          />
        </Modal>
        <Drawer
          width={640}
          visible={!!(selectedOrg && selectedOrg._label)}
          onClose={() => setSelectedOrg(undefined)}
          title={selectedOrg && selectedOrg._label}
        >
          {selectedOrg && (
            <OrgForm
              org={{
                label: selectedOrg._label,
                description: selectedOrg.description,
              }}
              onSubmit={(o: Organization) => saveAndModify(selectedOrg, o)}
              onDeprecate={() => saveAndDeprecate(selectedOrg)}
              busy={formBusy}
              mode="edit"
            />
          )}
        </Drawer>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  displayPerPage: state.uiSettings.pageSizes.orgsListPageSize,
  paginatedOrgs: (state.nexus && state.nexus.orgs.data) || undefined,
});

const mapDispatchToProps = (dispatch: any) => ({
  goTo: (org: string) => dispatch(push(`/${org}`)),
  goToProject: (project: Project) =>
    dispatch(push(`/${project.orgLabel}/${project.label}`)),
  createOrg: (orgLabel: string, orgPayload: CreateOrgPayload) =>
    dispatch(createOrg(orgLabel, orgPayload)),
  modifyOrg: (orgLabel: string, rev: number, orgPayload: CreateOrgPayload) =>
    dispatch(modifyOrg(orgLabel, rev, orgPayload)),
  deprecateOrg: (orgLabel: string, rev: number) =>
    dispatch(deprecateOrg(orgLabel, rev)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Landing);
