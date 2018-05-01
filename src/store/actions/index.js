import navigateActions from "./navigate";
import instanceActions from "./instance";
import loadingActions from "./loading";
import {
  auth as authModule,
  searchBar as searchBarModule,
  searchResults as searchResultsModule
} from "../modules";

export const navigate = navigateActions;
export const instance = instanceActions;
export const loading = loadingActions;
export const auth = authModule.actions;
export const searchBar = searchBarModule.actions;
export const searchResults = searchResultsModule.actions;
