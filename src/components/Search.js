import React from "react";
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { WithStore } from "@bbp/nexus-react";
import { navigate, searchResults } from "../store/actions";
import Relationship from "./shapes/Relationship";
import { connect } from 'react-redux';

const SearchResults = query => {
  return (
    <main className="flex">
      <div className="wrapper">
        <WithStore
          mapStateToProps={({ searchResults, config }) => ({
            pending: searchResults.pending,
            error: searchResults.error,
            results: searchResults.results,
            hits: searchResults.hits,
            api: config.api
          })}
          mapDispatchToProps={{
            goToEntityByID: navigate.goToEntityByID
          }}
        >
          {({ hits, results, goToEntityByID, api }) => {
            return (
              <section className="column full">
                <h1>Search results for &quot;{query}&quot;</h1>
                <hr />

                {!!results.length && (
                  <ul id="search-results">
                    {results.map(result => {
                      return (
                        <li
                          key={result.resultId}
                          onClick={() => goToEntityByID(result.resultId)}
                        >
                          <Relationship
                            value={result.source}
                            api={api}
                          />
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
                    {hits - results.length > 0 && (
                      <li>
                        <a>check out the rest of the results</a>
                      </li>
                    )}
                  </ul>
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
  componentWillMount () {
    let { query, api, token } = this.props;
    this.props.search({ query, api, token })
  }
  render() {
    return SearchResults(this.props.query);
  }
}


SearchResultsContainer.propTypes = {
  search: PropTypes.func.isRequired,
  api: PropTypes.string.isRequired,
  query: PropTypes.string,
  token: PropTypes.string
};

function mapStateToProps ({ routing, config, auth }) {
  return {
    query: routing.location.search.replace('?q=', ''),
    api: config.api,
    token: auth.token
  }
}

function mapDispatchToProps (dispatch) {
  return {
    search: bindActionCreators(searchResults.search, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchResultsContainer);