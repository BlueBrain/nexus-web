import React from "react";
import { Search, WithStore, Dropdown } from "@bbp/nexus-react";
import { searchBar, navigate } from "../store/actions";
import { Relationship } from "./shapes";

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
    <div className="padding">
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
    {hits - results.length > 0 && <a className="nudge-on-hover"><span>check out the rest of the results</span></a>}
  </Dropdown>
);

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
