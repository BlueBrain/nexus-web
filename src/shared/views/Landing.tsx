import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { useNexus, AccessControl } from '@bbp/react-nexus';
import { OrganizationList, ListOrgOptions, NexusClient } from '@bbp/nexus-sdk';
import {
  Organization,
  PaginatedList,
  PaginationSettings,
  Project,
} from '@bbp/nexus-sdk-legacy';
import { RootState } from '../store/reducers';
import { createOrg, modifyOrg, deprecateOrg } from '../store/actions/orgs';
import OrgList from '../components/Orgs/OrgList';
import { fetchOrgs } from '../store/actions/nexus/orgs';
import Skeleton from '../components/Skeleton';
import { Button, Modal, Drawer, notification, Empty } from 'antd';
import OrgForm from '../components/Orgs/OrgForm';
import { CreateOrgPayload } from '@bbp/nexus-sdk-legacy/lib/Organization/types';
import { Link } from 'react-router-dom';
import { getDestinationParam } from '../utils';
import RecentlyVisited from '../components/RecentlyVisited';

interface LandingProps {
  paginatedOrgs?: PaginatedList<Organization>;
  displayPerPage: number;
  busy: boolean;
  error?: { message: string; name: string };
  goTo(orgLabel: string): void;
  goToProject(Project: Project): void;
  fetchOrgs(paginationSettings?: PaginationSettings): any;
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
  busy,
  error,
  goTo,
  fetchOrgs,
  createOrg,
  modifyOrg,
  deprecateOrg,
  displayPerPage,
  goToProject,
}) => {
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedOrg, setSelectedOrg] = React.useState<
    Organization | undefined
  >(undefined);
  React.useEffect(() => {
    paginatedOrgs.results.length === 0 &&
      fetchOrgs({
        size: displayPerPage,
        from: paginatedOrgs.index,
      });
  }, []);

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

  const saveAndModify = (selectedOrg: Organization, newOrg: Organization) => {
    setFormBusy(true);
    modifyOrg(newOrg.label, selectedOrg.rev, {
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

          fetchOrgs({
            size: displayPerPage,
            from: paginatedOrgs.index,
          });
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

  const saveAndDeprecate = (selectedOrg: Organization) => {
    setFormBusy(true);

    deprecateOrg(selectedOrg.label, selectedOrg.rev)
      .then(
        () => {
          notification.success({
            message: 'Organization deprecated',
            duration: 2,
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedOrg(undefined);

          fetchOrgs({
            size: displayPerPage,
            from: paginatedOrgs.index,
          });
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

  if (busy) {
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

  if (error) {
    if (error.message === 'Error: Forbidden') {
      return (
        <Empty
          style={{ marginTop: '22vh' }}
          description={
            <span>
              You need to{' '}
              <Link to={`/login${getDestinationParam()}`}>login</Link> in order
              to list Organizations
            </span>
          }
        />
      );
    }
    return (
      <Empty
        style={{ marginTop: '22vh' }}
        description="There was a problem while loading Organizations"
      />
    );
  }

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
        {paginatedOrgs.total === 0 ? (
          <Empty
            style={{ marginTop: '22vh' }}
            description="No Organizations found..."
          />
        ) : (
          <OrgList
            pageSize={displayPerPage}
            onOrgClick={label => {
              goTo(label);
            }}
            onOrgEdit={(orgLabel: string) =>
              setSelectedOrg(
                paginatedOrgs.results.filter(o => o.label === orgLabel)[0]
              )
            }
            createOrg={() => setModalVisible(true)}
          />
        )}
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
          visible={!!(selectedOrg && selectedOrg.label)}
          onClose={() => setSelectedOrg(undefined)}
          title={selectedOrg && selectedOrg.label}
        >
          {selectedOrg && (
            <OrgForm
              org={selectedOrg}
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
  busy: (state.nexus && state.nexus.orgs.isFetching) || false,
  error: (state.nexus && state.nexus.orgs.error) || undefined,
});

const mapDispatchToProps = (dispatch: any) => ({
  goTo: (org: string) => dispatch(push(`/${org}`)),
  goToProject: (project: Project) =>
    dispatch(push(`/${project.orgLabel}/${project.label}`)),
  fetchOrgs: (paginationSettings?: PaginationSettings) =>
    dispatch(fetchOrgs(paginationSettings)),
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
