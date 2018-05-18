import React from "react";
import { Search, WithStore, Dropdown, Shapes } from "@bbp/nexus-react";
import PropTypes from 'prop-types';
import { searchBar, navigate } from "../store/actions";
const { Relationship } = Shapes;

const SearchRecommendationsDropdown = ({
  down,
  value,
  results,
  hits,
  api,
  goToEntityByID,
  onSubmit
}) => (
  <Dropdown down={down}>
    {!!results.length && (
      <div className="search-feedback">
        <Search.components.SearchForComponent
          className="nudge-on-hover"
          value={value}
          href="/"
          onSubmit={onSubmit}
        />
      </div>
    )}
    <div className="padding border-bottom">
      {results.length ? (
        <div>
          Displaying: {results.length}
          <small> of {hits} instances found</small>
        </div>
      ) : (
        <div>No instances found</div>
      )}
      {RecommendationsList(results, api, goToEntityByID)}
    </div>
    {hits - results.length > 0 && <div className="paddingless"><a onClick={onSubmit} className="nudge-on-hover padding half"><span>See more</span></a></div>}
  </Dropdown>
);

SearchRecommendationsDropdown.propTypes = {
  down: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  results: PropTypes.number.isRequired,
  hits: PropTypes.number.isRequired,
  api: PropTypes.string.isRequired,
  goToEntityByID: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

const RecommendationsList = (results, api, goToEntityByID) => (
  <React.Fragment>
    {!!results.length && (
      <ul id="search-results">
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
      </ul>
    )}
  </React.Fragment>
);

const SearchBar = () => (
  <div className="search-bar-block">
    <WithStore
      mapStateToProps={({ searchBar, config, auth }) => ({
        pending: searchBar.pending,
        error: searchBar.error,
        results: searchBar.results,
        hits: searchBar.hits,
        api: config.api,
        token: auth.token
      })}
      mapDispatchToProps={{
        search: searchBar.search,
        goToEntityByID: navigate.goToEntityByID,
        goToSearch: navigate.goToSearch
      }}
    >
      {({
        pending,
        error,
        results,
        hits,
        api,
        token,
        search,
        goToEntityByID,
        goToSearch
      }) => (
        <Search.Container
          pending={pending}
          error={error}
          search={value => search({ query: value, api, token })}
          onSubmit={value => {
            console.log('value: ', value);
            goToSearch(value)}
          }
        >
          {({ value, onSubmit }) =>
            SearchRecommendationsDropdown({ down: value && !pending, value, results, hits, goToEntityByID, onSubmit })
          }
        </Search.Container>
      )}
    </WithStore>
  </div>
);

export default SearchBar;
