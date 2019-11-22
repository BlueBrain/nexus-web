import * as StackTrace from 'stacktrace-js';

export const formatError = async (error: Error): Promise<string> => {
  const traces: StackTrace.StackFrame[] = await StackTrace.fromError(error);
  return traces
    .map(
      trace =>
        `at ${trace.functionName} (${trace.fileName}:${trace.lineNumber}:${trace.columnNumber})`
    )
    .join('\n')
    .replace(/^/, `${error.name}: ${error.message}\n`);
};

export const reportError = async (
  error: Error | string,
  fatal: boolean = false
): Promise<void> => {
  const gtag: (
    command: string,
    hitType: string,
    fieldsObject: {
      description: string;
      fatal?: boolean;
    }
  ) => {} =
    // @ts-ignore
    typeof window.gtag === 'function'
      ? //
        // @ts-ignore
        window.gtag
      : //
        function() {
          console.warn('Google Analytics is not available.');
        };

  const description =
    typeof error === 'string' ? error : await formatError(error);

  gtag('event', 'exception', {
    description,
    fatal,
  });
};
