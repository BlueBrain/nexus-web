/**
 * Represents an issue identified by the linter.
 */
export type LinterIssue = {
  /** A message describing the issue. */
  message: string;
  /** The line number where the issue occurs. */
  line: number;
};

/**
 * A custom linter function that checks for issues in a given text.
 *
 * The function specifically looks for fields in the text that start with an underscore,
 * which are considered as errors according to the linter's rules.
 *
 * @param text The text to be linted.
 * @returns An array of LinterIssue objects, each representing a specific issue found in the text.
 */
export const customLinter = (text: string): LinterIssue[] => {
  const linterErrors: LinterIssue[] = [];

  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    return linterErrors;
  }

  // We only iterate through top-level keys of the parsed object
  for (const key in json) {
    if (Object.prototype.hasOwnProperty.call(json, key)) {
      // Identify the actual key starting character by trimming the left side
      const actualKeyStart = key.trimLeft()[0];

      if (actualKeyStart === '_') {
        linterErrors.push({
          message:
            'Top-level fields starting with an underscore are reserved for internal use',
          line: findLineOfKey(text, key),
        });
      }
    }
  }

  return linterErrors;
};

/**
 * Find the line number of the first occurrence of a key in the given text.
 * @param text The text to search through.
 * @param key The key whose line number we want to find.
 * @return The line number where the key is first found.
 */
function findLineOfKey(text: string, key: string): number {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`"${escapedKey}"\s*:`);
  const matches = text.match(regex);

  // Calculate the line number based on the position of the match
  if (matches && matches.index !== undefined) {
    return text.substring(0, matches.index).split('\n').length;
  }
  return -1;
}
