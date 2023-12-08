import * as stringSimilarity from 'string-similarity';

/**
 * Returns an array of strings sorted by similarity
 * @params string, string[]
 * @return string[]
 */
export const sortStringsBySimilarity = (value: string, targetValues: string[]): string[] => {
  const matchedValues = stringSimilarity.findBestMatch(value, targetValues);

  return matchedValues.ratings
    .sort(
      (
        valueOne: { target: string; rating: number },
        valueTwo: { target: string; rating: number }
      ) => {
        return valueTwo.rating - valueOne.rating;
      }
    )
    .map((result: { target: string; rating: number }) => result.target);
};

/**
 *
 * @param searchValue  value to search for
 * @param propertyToCompare property of object to use for similarity
 * @param objectsToSearch array of objects to sort
 * @returns
 */
export const sortObjectsBySimilarity = <T>(
  searchValue: string,
  propertyToCompare: string,
  objectsToSearch: T[]
): T[] => {
  const ratings = stringSimilarity.findBestMatch(
    searchValue,
    objectsToSearch.map((v) => (v as any)[propertyToCompare])
  );

  const ratedObjects = objectsToSearch.map((o, i) => ({
    object: o,
    rating: ratings.ratings[i].rating,
  }));

  return ratedObjects.sort((a: any, b: any) => b.rating - a.rating).map((o) => ({ ...o.object }));
};
