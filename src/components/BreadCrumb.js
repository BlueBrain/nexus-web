import React from 'react';
import styled from 'styled-jss';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';
import { navigate } from '../store/actions';

const div = styled('div');
const CrumbBlock = div({
  padding: '0 1em'
});

const CrumbSpacer = div({
  padding: '0 0.5em'
});

const CrumbAction = div({
  backgroundColor: 'rgba(185, 233, 212, 0.5)',
  borderRadius: '1px',
  '&:hover': {
    backgroundColor: '#b9e9d4'
  }
});

const Crumb = (entity, id, pickEntity) =>
    <a onClick={() => pickEntity ? pickEntity({ entity, id }) : () => {}}>
        <CrumbBlock>{id}</CrumbBlock>
    </a>

const ExpandedCrumb = div({
  display: 'flex',
  maxHeight: '500px',
  height: '2.5em',
  opacity: 1,
  boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.3)',
  backgroundColor: '#fcfdfd',
  fontSize: 'small',
  padding: '0.5em 0',
  justifyContent: 'flex-start',
  transition: 'all 300ms cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  flexGrow: 0,
  backgroundColor: '#fcfdfd'
});

const ClosedCrumb = div({
  height: 0
});

const BreadCrumbComponent = ({ org, domain, schema, ver, goDown, pickEntity, badEntity }) => {
    // we don't need instance because it's always covered by the modal
    const BreadCrumb = org ? ExpandedCrumb : ClosedCrumb;
    if (badEntity) { return null; }
    return <BreadCrumb>
        {org && Crumb('org', org, pickEntity)}
        {domain && <CrumbSpacer><FontAwesome name="angle-right"/></CrumbSpacer>}
        {domain && Crumb('domain', domain, pickEntity)}
        {schema && <CrumbSpacer><FontAwesome name="angle-right"/></CrumbSpacer>}
        {schema && Crumb('schema', schema + '_' + ver, pickEntity)}
        {org && <a onClick={() => goDown()}><CrumbAction><FontAwesome name="step-backward"/></CrumbAction></a>}
    </BreadCrumb>;
}

BreadCrumbComponent.propTypes = {
    org: PropTypes.string,
    domain: PropTypes.string,
    schema: PropTypes.string,
    ver: PropTypes.string,
    badEntity: PropTypes.string,
    goDown: PropTypes.func,
    pickEntity: PropTypes.func
};

function mapStateToProps({ pick, list }) {
    const state = pick
    return {
        badEntity: list.error ? list.error.entity : null,
        org: state.org,
        domain: state.domain,
        schema: state.schema,
        ver: state.ver,
    };
}

function mapDispatchToProps (dispatch) {
    return {
        pickEntity: bindActionCreators(navigate.pickEntity, dispatch),
        goDown: bindActionCreators(navigate.goDown, dispatch),
    }
  }

export default connect(mapStateToProps, mapDispatchToProps)(BreadCrumbComponent);
