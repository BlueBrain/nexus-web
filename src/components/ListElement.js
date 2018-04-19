import React from 'react';
import styled from 'styled-jss';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';
import { getDomainsList, getSchemasList, getInstancesList, getInstance  } from '@bbp/nexus-js-helpers';
import { navigate } from '../store/actions';
import { getToken } from '../auth';

const relations = {
    'org': getDomainsList,
    'domain': getSchemasList,
    'schema': getInstancesList,
    'instance': getInstance
};

const Li = styled('li')({
  position: 'relative',
  display: 'flex',
  justifyContent: 'space-between',
  cursor: 'pointer',
  padding: '0.5em',
  borderBottom: '1px solid #b4c3ca12',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '&.active': {
    backgroundColor: '#e2f8ff',
    '& span': {
      marginLeft: '0.25em'
    }
  },
  '&.empty': {
    color: '#969696',
    cursor: 'default',
    '&:hover': {
      backgroundColor: '#e2f8ff4d'
    },
    '&:hover span': {
      marginLeft: 0
    }
  },
  '&:nth-child(odd)': {
    backgroundColor: '#fcfdfd'
  },
  '&:hover': {
    backgroundColor: '#e2f8ff'
  },
  '&:hover span': {
    marginLeft: '0.25em'
  }
});

const Span = styled('span')({
  transition: 'all 300ms cubic-bezier(0.18, 0.89, 0.32, 1.28)',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  '&.total': {
    color: '#969696',
    fontSize: 'x-small'
  }
});

const ListElementComponent = ({ status, content, total, id, entity, active }, handleClick) => {
  const className = (active ? id + ' active' : id ) +
    (!total && entity !== 'instance' ? ' empty' : '')
  return <Li
    onClick = { total || entity === 'instance' ? handleClick : () => {} }
    data-id = { id }
    className = { className }>
    <Span>{ content }</Span>
    { status !== 'failure' &&
      <Span className="total">
        {
          status === 'loading'?
          <FontAwesome
            name='spinner'
            spin
            style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
          />:
          <span><b>{ total>0?'( '+total+ ' )':'' }</b></span>
        }
      </Span>
    }
  </Li>;
}

ListElementComponent.propTypes = {
  status: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  entity: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired
};

class ListElementContainer extends React.PureComponent {
  constructor(props) {
    super(props);
    const { id, content, entity, active } = this.props;
    this.state = {
      // Start with fulfilled, switch to loading only if there is a fetchAmount prop to call
      status: 'fulfilled',
      id,
      content,
      entity,
      active,
      total: 0,
    };
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    this.processAmount()
  }
  componentWillReceiveProps(props) {
    this.setState({ active: props.active });
  }
  processAmount () {
    const { entity, id, config, org, domain, schema, ver, instance } = this.props;
    if (entity === 'instance') { return; }
    const boundary = [org, domain, schema, ver, instance].indexOf(this.props[entity]);
    const uriParts = [org, domain, schema, ver, instance].slice(0, boundary);
    const parts = uriParts.filter(element => {
      if (element && element !== this.props[entity]) {
        return element;
      }
    });
    if (entity === 'schema') {
      const [s, v] = id.split('_');
      parts.push(s);
      parts.push(v);
    } else {
      parts.push(id);
    }
    this.setState({ status: 'loading' });
    return relations[entity](parts, { deprecated: false }, config.api, false, getToken())
      .then(({ total=0 }) => {
        this.setState({
          status: 'fulfilled',
          total
        });
      })
      .catch(error => {
        console.error(error);
        this.setState({ status: 'failure' });
      });
  }
  render() {
    return ListElementComponent(this.state, this.handleClick.bind(this))
  }
  handleClick() {
    const { entity, id } = this.props;
    this.props.pickEntity({ entity, id });
  }
}

function mapStateToProps({ pick, config }) {
  const state = pick
  return {
    config: config,
    org: state.org,
    domain: state.domain,
    schema: state.schema,
    ver: state.ver,
    instance: state.instance
  };
}

function mapDispatchToProps (dispatch) {
  return {
    pickEntity: bindActionCreators(navigate.pickEntity, dispatch),
  }
}

ListElementContainer.propTypes = {
  content: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  pickEntity: PropTypes.func.isRequired,
  entity: PropTypes.string.isRequired,
  id: PropTypes.string,
  config: PropTypes.any,
  org: PropTypes.string,
  domain: PropTypes.string,
  schema: PropTypes.string,
  ver: PropTypes.string,
  instance: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(ListElementContainer);
