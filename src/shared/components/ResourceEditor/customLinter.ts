export type LinterIssue = {
  message: string;
  line: number;
};

// Define the type for the changed lines you'll pass into the linter
export type ChangedLineInfo = {
  lineNumber: number;
  content: string;
};

export const customLinter = (
  changedLines: ChangedLineInfo[]
): LinterIssue[] => {
  const linterErrors: LinterIssue[] = [];
  const regex = /"\s*_(\w+)"/g;

  changedLines.forEach(({ lineNumber, content }) => {
    // Check for fields starting with an underscore
    if (regex.test(content)) {
      // If the regex matches, push a new LinterIssue to the array
      linterErrors.push({
        message: 'Cannot have fields starting with an underscore',
        line: lineNumber, // Use the lineNumber from the ChangedLineInfo
      });
    }
  });

  return linterErrors;
};
