import React from "react";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import ReactPaginate from "react-paginate";
import { WithStore, Spinner, Shapes } from "@bbp/nexus-react";
import { navigate, searchResults } from "../store/actions";
import { connect } from "react-redux";
import { getParameterByName } from "../libs/url";
const { Relationship } = Shapes;
const DEFAULT_PAGE_SIZE = 20;

const Paginate = ({ totalPages, selected, handlePageClick }) => {
  return (
    <ReactPaginate
      containerClassName="pagination column-footer"
      previousLabel={"<"}
      nextLabel={">"}
      breakLabel={<a href="">...</a>}
      breakClassName={"break-me"}
      pageCount={totalPages}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={handlePageClick}
      subContainerClassName={"pages pagination"}
      activeClassName={"active"}
      forcePage={selected}
    />
  );
};

Paginate.propTypes = {
  totalPages: PropTypes.number.isRequired,
  selected: PropTypes.any.isRequired,
  handlePageClick: PropTypes.func.isRequired
};

const SearchResultsFound = (results, hits, pageParams, goToEntityByID, api) => {
  return (
    <React.Fragment>
      <ul id="search-results" className="grow">
        {results.map(result => {
          return (
            <li
              key={result.resultId}
              onClick={() => goToEntityByID(result.resultId)}
            >
              <Relationship value={result.source} api={api} />
            </li>
          );
        })}
        {results.length ? (
          <div>
            Displaying: {results.length}
            <small> of {hits} instances found</small>
          </div>
        ) : (
          <div>No instances found</div>
        )}
      </ul>
      {hits - results.length > 0 &&
        Paginate({ totalPages: hits / pageParams.pageSize, ...pageParams })}
    </React.Fragment>
  );
};

const SearchResults = (query, pageParams) => {
  return (
    <main className="flex">
      <div className="wrapper">
        <WithStore
          mapStateToProps={({ searchResults, config, auth }) => ({
            pending: searchResults.pending,
            error: searchResults.error,
            results: searchResults.results,
            hits: searchResults.hits,
            api: config.api,
            loggedIn: !!auth.token,
            loginURI: config.loginURI
          })}
          mapDispatchToProps={{
            goToEntityByID: navigate.goToEntityByID
          }}
        >
          {({ hits, results, goToEntityByID, api, loggedIn, loginURI, pending }) => {
            console.log(pending);
            return (
              <section className="padding column full flex space-between">
                <h1 className="search-feedback border-bottom">
                  Search results for &quot;{query}&quot;
                </h1>
                {pending &&
                  <div className="center grow spinner">
                    <Spinner />
                  </div>
                }
                {!!results.length &&
                  SearchResultsFound(
                    results,
                    hits,
                    pageParams,
                    goToEntityByID,
                    api
                  )}
                {!results.length && !pending && (
                  <div className="center grow">
                    <h3>Hmmmm...</h3>
                    <p>We didn&#39;t manage to find any instances matching &quot;{query}&quot;
                    </p>
                    {!loggedIn && (
                      <p>
                        Expecting something different? try{" "}
                        <a href={`${loginURI}?q=${query}`}>logging in.</a>
                      </p>
                    )}
                  </div>
                )}
              </section>
            );
          }}
        </WithStore>
      </div>
    </main>
  );
};

class SearchResultsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      from: 0,
      selected: null
    };
    this.pageSize = this.props.pageSize || DEFAULT_PAGE_SIZE;
  }
  componentWillMount() {
    this.search(this.props);
  }
  componentWillReceiveProps(props) {
    this.search(props);
  }
  handlePageClick({ selected }) {
    const from = Math.ceil(selected * this.pageSize);
    this.setState({ from, selected }, () => this.search(this.props));
  }
  search(props) {
    let { query, api, token } = props;
    let { from } = this.state;
    this.props.search({ query, api, token, from, size: this.pageSize });
  }
  render() {
    let { selected } = this.state;
    return SearchResults(this.props.query, {
      pageSize: this.pageSize,
      selected,
      handlePageClick: this.handlePageClick.bind(this)
    });
  }
}

SearchResultsContainer.propTypes = {
  search: PropTypes.func.isRequired,
  api: PropTypes.string.isRequired,
  query: PropTypes.string,
  token: PropTypes.string,
  pageSize: PropTypes.number
};

function mapStateToProps({ config, auth }) {
  let query = getParameterByName(window.location.href, "q");
  return {
    query,
    api: config.api,
    token: auth.token
  };
}

function mapDispatchToProps(dispatch) {
  return {
    search: bindActionCreators(searchResults.search, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  SearchResultsContainer
);
