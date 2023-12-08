import * as React from 'react';

const HasPermission = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" {...props}>
    <path
      fill="#000"
      d="M6 0C2.69 0 0 2.69 0 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6Zm0 2.627c.821 0 1.49.67 1.49 1.491 0 .821-.669 1.49-1.49 1.49s-1.49-.669-1.49-1.49c0-.82.669-1.49 1.49-1.49ZM8.45 8.73c0 .139-.113.265-.265.265h-4.37a.267.267 0 0 1-.266-.266v-.176A2.453 2.453 0 0 1 6 6.102a2.453 2.453 0 0 1 2.45 2.45l.001.177Z"
    />
    <circle cx={16} cy={6} r={6} fill="#4AC947" />
    <path
      fill="#000"
      fillRule="evenodd"
      d="M19 3.45 15.678 8 13 6.191l.466-.64 2.014 1.36L18.336 3l.664.45Z"
      clipRule="evenodd"
    />
  </svg>
);
export default HasPermission;
