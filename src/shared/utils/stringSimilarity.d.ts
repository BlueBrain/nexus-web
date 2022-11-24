/**
 * Returns an array of strings sorted by similarity
 * @params string, string[]
 * @return string[]
 */
export declare const sortStringsBySimilarity: (
  value: string,
  targetValues: string[]
) => string[];
/**
 *
 * @param searchValue  value to search for
 * @param propertyToCompare property of object to use for similarity
 * @param objectsToSearch array of objects to sort
 * @returns
 */
export declare const sortObjectsBySimilarity: <T>(
  searchValue: string,
  propertyToCompare: string,
  objectsToSearch: T[]
) => T[];
