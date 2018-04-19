import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { navigate } from '../../store/actions';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import InstanceHeader from './Header';
import InstanceBody from './Body';
import Modal from 'react-responsive-modal';
import Links from './Links';
import ReactJson from 'react-json-view'

// TODO how do we want to display errors?
const InstanceComponent = (open, error, pending, data, goDown) =>
  <Modal
    open={open}
    onClose={goDown}
    showCloseIcon={!pending}
    classNames={{ overlay: 'instance-modal', modal: 'instance-modal-container', closeIcon: 'instance-close-icon' }}>
    { error && Failure(error) }
    { !error &&
      (data ? Fulfilled(data) : Loading())
    }
  </Modal>

const Loading = () => <div className="modal-message"><h4>loading...</h4></div>

const Failure = error => <div className="modal-message"><h4>There was an error processing this request.</h4><p>{error.message}</p></div>

const Fulfilled = instance =>
    <div className="instance flex center">
      <Links which="incoming" resolvedLinks={instance.resolvedLinks}/>
      <div className="modal-content">
        <Tabs>
        <div className="modal-header">
          { InstanceHeader(instance) }
          <TabList>
            <Tab>Fields</Tab>
            <Tab>JSON preview</Tab>
          </TabList>
        </div>
          <div className="modal-body container">
          <TabPanel>
            { InstanceBody(instance) }
          </TabPanel>
          <TabPanel>
            <div className="json-viewer">
              <ReactJson src={instance} />
            </div>
          </TabPanel>
          </div>
      </Tabs>
      </div>
      <Links which="outgoing" resolvedLinks={instance.resolvedLinks}/>
    </div>

const InstanceContainer = props => {
  const { open, error, pending, data, goDown } = props;
    return InstanceComponent(open, error, pending, data, goDown);
}

function mapDispatchToProps (dispatch) {
  return {
    goDown: bindActionCreators(navigate.goDown, dispatch)
  };
}

function mapStateToProps({ instance, pick }) {
  if (instance.data) {
    instance.data.metaFields = [
      'distribution',
      '@id',
      '@context',
      '@type',
      'nxv:deprecated',
      'nxv:rev',
      'links',
      'resolvedLinks',
      'metaFields',
      'numFields'
    ];
    instance.data.numFields = Object.keys(instance).filter(key => instance.data.metaFields.indexOf(key) < 0).length;
  }
  return {
    ...instance,
    open: !!pick.instance
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstanceContainer);
