import * as stringSimilarity from 'string-similarity';

/**
 * Returns an array of strings sorted by similarity
 * @params string, string[]
 * @return string[]
 */
export const sortStringsBySimilarity = (
  value: string,
  targetValues: string[]
) => {
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
