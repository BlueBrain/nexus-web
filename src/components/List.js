import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import ReactPaginate from 'react-paginate';
import { connect } from 'react-redux';
import { getOrgList, getDomainsList, getSchemasList, getInstancesList } from '@bbp/nexus-js-helpers';

import ListElement from './ListElement';

import { navigate } from '../store/actions';

const relations = {
  'org': {
    'fetch': getOrgList,
  },
  'domain': {
    'parent': 'org',
    'fetch': getDomainsList
  },
  'schema': {
    'parent': 'domain',
    'fetch': getSchemasList
  },
  'instance': {
    'parent': 'schema',
    'fetch': getInstancesList
  }
};

const Paginate = (totalNumberOfPages, selected, handlePageClick) => {
  return <ReactPaginate
    containerClassName="pagination column-footer"
    previousLabel={"<"}
    nextLabel={">"}
    breakLabel={<a href="">...</a>}
    breakClassName={"break-me"}
    pageCount={totalNumberOfPages}
    marginPagesDisplayed={2}
    pageRangeDisplayed={3}
    onPageChange={handlePageClick}
    subContainerClassName={"pages pagination"}
    activeClassName={"active"}
    forcePage={selected}
  />
}

const ListElements = ({ results, active, splitPattern, entity }) =>
  results
    .map(({ resultId, source }) => {
      const _label = resultId.split(splitPattern).pop();
      const _ID = _label.replace('/', '_');
      return Object.assign({ _ID }, { _label }, source);
    })
    .map(instance => {
      let content = instance._label;
      const description = instance['skos:prefLabel'] || instance['rdfs:comment'] || instance['schema:description'];
      if (description !== undefined && description.trim() !== "") {
        content = description;
      }

      const name = instance['skos:prefLabel'] || instance['rdfs:label'] || instance['schema:name'] || instance['name'];
      if (name !== undefined && name.trim() !== "") {
        content = name;
      } else if (!name && entity === 'instance') {
        let split = content.split('-')
        content = '...' + split[split.length - 1]
      }
      return <ListElement
        identifier={instance['@id']}
        key={instance._ID}
        id={instance._ID}
        content={content}
        entity={entity}
        active={instance._ID === active}
      />
    })

class List extends React.PureComponent {
  constructor(props) {
    super(props);
    const { splitPattern = '/', entity } = props;
    this.state = {
      status: 'init',
      results: [],
      offset: 0,
      splitPattern,
      selected: null,
      totalNumberOfPages: 1,
      entity,
      total: 0
    };
  }
  componentDidMount() {
    this.fetchResults(this.props);
  }
  UNSAFE_componentWillReceiveProps(props) {
    if (props[relations[props.entity]['parent']] !== this.props[relations[props.entity]['parent']]) {
      this.fetchResults(props);
    }
    // Reload lists if authentication has occured
    // TODO is there a better way to trigger this?
    if (props.token !== this.props.token) {
      this.fetchResults(props);
    }
    const conditionForRendering = this.state.results.length > 0 && ((relations[props.entity]['parent'] && props[relations[props.entity]['parent']]) || props.entity === 'org')
    if (!conditionForRendering) {
      this.setState({ total: 0 });
    }
  }
  fetchResults(props) {
    const { offset, entity } = this.state;
    if (!props[relations[entity]['parent']] && (entity !== 'org')) {
      return;
    }

    const { api, pageSize, org, domain, schema, ver, instance, token } = props;
    const options = { fields: 'all', deprecated: false, from: offset, size: pageSize };
    const boundary = [org, domain, schema, ver, instance].indexOf(props[entity]);
    const uriParts = [org, domain, schema, ver, instance].slice(0, boundary);
    const parts = uriParts.filter(element => element);
    this.setState({ status: 'loading', results: [] });
    relations[entity]['fetch'](parts, options, api, false, token)
      .then(({ results, total }) => {
        this.setState({
          status: 'fulfilled',
          results,
          total,
          totalNumberOfPages: Math.ceil(total / pageSize)
        });
      })
      .catch(error => {
        console.error(error);
        this.props.fetchListFailed(error, this.state.entity);
        this.setState({ status: 'failure' });
      });
  }
  handlePageClick({ selected }) {
    const offset = Math.ceil(selected * (this.props.pageSize || 20));
    this.setState({ offset, selected }, () => this.fetchResults(this.props));
  }
  render() {
    const { name, entity } = this.props;
    const { total, results, status, totalNumberOfPages, selected } = this.state;
    const statusToText = {
      'init': '',
      'loading': 'Fetching...',
      'failure': 'There was an error.',
      'not found': 'Nothing found.'
    };
    const conditionForRendering = results.length > 0 && ((relations[entity]['parent'] && this.props[relations[entity]['parent']]) || entity === 'org');
    const active = entity === 'schema' ? this.props.schema + '_' + this.props.ver : this.props[entity];
    return <React.Fragment>
      <section className={entity + ' column'}>
        <h2>
          {name}
          {
            total !== undefined ?
              <span>{"(" + total + ")"}</span> :
              ''
          }
        </h2>
        <div className="list">
          {
            statusToText[status] && status !== 'init' ?
              <div className="status">{statusToText[status]}</div> :
              ''
          }
          <ul className="explorer-list">
            {
              conditionForRendering ?
                <ListElements
                  results={results}
                  splitPattern={this.state.splitPattern}
                  uriParam={this.state.uriParam}
                  active={active}
                  entity={entity} /> :
                ''
            }
          </ul>
        </div>
        {totalNumberOfPages > 1 && conditionForRendering &&
          Paginate(totalNumberOfPages, selected, this.handlePageClick.bind(this))
        }
      </section>
    </React.Fragment>
  }
}

function mapStateToProps({ pick, config, auth }) {
  const state = pick
  return {
    pageSize: config.pageSize,
    api: config.api,
    org: state.org,
    domain: state.domain,
    schema: state.schema,
    ver: state.ver,
    instance: state.instance,
    token: auth.token
  };
}

function mapDispatchToProps (dispatch) {
  return {
    fetchListFailed: bindActionCreators(navigate.fetchListFailed, dispatch)
  };
}

List.propTypes = {
  pageSize: PropTypes.number,
  api: PropTypes.string,
  org: PropTypes.string,
  domain: PropTypes.string,
  schema: PropTypes.string,
  ver: PropTypes.string,
  instance: PropTypes.string,
  entity: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  splitPattern: PropTypes.any,
  fetchListFailed: PropTypes.func.isRequired,
  token: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
