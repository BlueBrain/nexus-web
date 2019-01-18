import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { RootState } from '../store/reducers';
import OrgList from '../components/Orgs/OrgList';
import { fetchOrgs } from '../store/actions/nexus';
import Skeleton from '../components/Skeleton';
import { Button, Modal, Drawer } from 'antd';
import OrgForm from '../components/Orgs/OrgForm';
import { Organization } from '@bbp/nexus-sdk';

interface LandingProps {
  orgs: Organization[];
  busy: boolean;
  goToProject(name: string): void;
  fetchOrgs(): void;
}

const Landing: React.FunctionComponent<LandingProps> = ({
  orgs,
  busy,
  goToProject,
  fetchOrgs,
}) => {
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedOrg, setSelectedOrg] = React.useState<
    Organization | undefined
  >(undefined);
  React.useEffect(() => {
    orgs.length === 0 && fetchOrgs();
  }, []);

  const saveAndCreate = () => {};
  const saveAndModify = () => {};

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
        onOrgClick={goToProject}
        onOrgEdit={(label: string) =>
          setSelectedOrg(orgs.filter(o => o.label === label)[0])
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
          onSubmit={(o: Organization) => saveAndCreate()}
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
            onSubmit={(o: Organization) => saveAndModify()}
            busy={formBusy}
            mode="edit"
          />
        )}
      </Drawer>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  orgs: (state.nexus && state.nexus.orgs.map(o => o)) || [],
  busy: (state.nexus && state.nexus.orgsFetching) || false,
});

const mapDispatchToProps = (dispatch: any) => ({
  goToProject: (org: string) => dispatch(push(`/${org}`)),
  fetchOrgs: () => dispatch(fetchOrgs()),
  // createOrg: (
  //   orgLabel: string,
  //   orgName: string,
  // ) => dispatch(createOrganization(orgLabel, orgName)),
  // modifyOrg: (
  //   orgLabel: string,
  //   rev: number,
  //   orgName: string,
  // ) => dispatch(modifyOrganization(orgLabel, rev, orgName)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Landing);
