import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Organization } from '@bbp/nexus-sdk';
import { RootState } from '../store/reducers';
import { createOrg, modifyOrg, deprecateOrg } from '../store/actions/orgs';
import OrgList from '../components/Orgs/OrgList';
import { fetchOrgs } from '../store/actions/nexus/orgs';
import Skeleton from '../components/Skeleton';
import { Button, Modal, Drawer, notification } from 'antd';
import OrgForm from '../components/Orgs/OrgForm';

interface LandingProps {
  orgs: Organization[];
  busy: boolean;
  goTo(orgLabel: string): void;
  fetchOrgs(): void;
  createOrg: (orgLabel: string, orgName: string) => Promise<Organization>;
  modifyOrg: (
    orgLabel: string,
    rev: number,
    orgName: string
  ) => Promise<Organization>;
  deprecateOrg: (orgLabel: string, rev: number) => Promise<void>;
}

const Landing: React.FunctionComponent<LandingProps> = ({
  orgs,
  busy,
  goTo,
  fetchOrgs,
  createOrg,
  modifyOrg,
  deprecateOrg,
}) => {
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedOrg, setSelectedOrg] = React.useState<
    Organization | undefined
  >(undefined);
  React.useEffect(() => {
    orgs.length === 0 && fetchOrgs();
  }, []);

  const saveAndCreate = (newOrg: Organization) => {
    setFormBusy(true);
    createOrg(newOrg.label, newOrg.name)
      .then(
        () => {
          notification.success({
            message: 'Organization created',
            duration: 2,
          });
          setFormBusy(false);
          goTo(newOrg.label);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Organization NOT create',
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

  const saveAndModify = (selectedOrg: Organization, newOrg: Organization) => {
    setFormBusy(true);
    modifyOrg(newOrg.label, (selectedOrg.rev = 1), newOrg.name)
      .then(
        () => {
          notification.success({
            message: 'Organization saved',
            duration: 2,
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedOrg(undefined);

          fetchOrgs();
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

          fetchOrgs();
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

  return orgs.length === 0 ? (
    <p style={{ marginTop: 50 }}>No organizations yet...</p>
  ) : (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ marginBottom: 0, marginRight: 8 }}>Organizations</h1>
        <Button
          type="primary"
          onClick={() => setModalVisible(true)}
          icon="plus-square"
        />
      </div>
      <OrgList
        orgs={orgs}
        onOrgClick={goTo}
        onOrgEdit={(orgLabel: string) =>
          setSelectedOrg(orgs.filter(o => o.label === orgLabel)[0])
        }
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
        visible={!!(selectedOrg && selectedOrg.name)}
        onClose={() => setSelectedOrg(undefined)}
      >
        {selectedOrg && (
          <OrgForm
            org={{
              name: selectedOrg.name,
              label: selectedOrg.label,
            }}
            onSubmit={(o: Organization) => saveAndModify(selectedOrg, o)}
            onDeprecate={() => saveAndDeprecate(selectedOrg)}
            busy={formBusy}
            mode="edit"
          />
        )}
      </Drawer>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  orgs: (state.nexus && state.nexus.orgs.data) || [],
  busy: (state.nexus && state.nexus.orgs.isFetching) || false,
});

const mapDispatchToProps = (dispatch: any) => ({
  goTo: (org: string) => dispatch(push(`/${org}`)),
  fetchOrgs: () => dispatch(fetchOrgs()),
  createOrg: (orgLabel: string, orgName: string) =>
    dispatch(createOrg(orgLabel, orgName)),
  modifyOrg: (orgLabel: string, rev: number, orgName: string) =>
    dispatch(modifyOrg(orgLabel, rev, orgName)),
  deprecateOrg: (orgLabel: string, rev: number) =>
    dispatch(deprecateOrg(orgLabel, rev)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Landing);
