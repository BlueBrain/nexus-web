/**
 * Represents an issue identified by the linter.
 */
export type LinterIssue = {
  /** A message describing the issue. */
  message: string;
  /** The line number where the issue occurs. */
  line: number;
};

export const customLinter = (text: string): LinterIssue[] => {
  const linterErrors: LinterIssue[] = [];

  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    // Handle JSON parsing errors if necessary
    console.error('Invalid JSON:', error);
    return linterErrors;
  }

  // We only iterate through top-level keys of the parsed object
  for (const key in json) {
    if (
      Object.prototype.hasOwnProperty.call(json, key) &&
      key.startsWith('_')
    ) {
      // Push an error for every top-level field starting with an underscore
      linterErrors.push({
        message:
          'Top-level fields starting with an underscore are reserved for internal use',
        line: findLineOfKey(text, key),
      });
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
  // Create a regex to escape the key and match it in the text
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`"${escapedKey}"\s*:`);
  const matches = text.match(regex);

  // Calculate the line number based on the position of the match
  if (matches && matches.index !== undefined) {
    return text.substring(0, matches.index).split('\n').length;
  }
  return -1; // Return -1 if the key is not found (this shouldn't happen for valid JSON)
}
