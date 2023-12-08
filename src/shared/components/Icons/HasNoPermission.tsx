import * as React from 'react';

const HasNoPermission = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="12px" fill="none" {...props}>
    <path
      fill="#000"
      d="M6 0C2.69 0 0 2.69 0 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6Zm0 2.627c.821 0 1.49.67 1.49 1.491 0 .821-.669 1.49-1.49 1.49s-1.49-.669-1.49-1.49c0-.82.669-1.49 1.49-1.49ZM8.45 8.73c0 .139-.113.265-.265.265h-4.37a.267.267 0 0 1-.266-.266v-.176A2.453 2.453 0 0 1 6 6.102a2.453 2.453 0 0 1 2.45 2.45l.001.177Z"
    />
    <circle cx={16} cy={6} r={6} fill="#F0BF3F" />
    <path
      fill="#000"
      fillRule="evenodd"
      d="M17.578 8 14 4.422 14.422 4 18 7.578 17.578 8Z"
      clipRule="evenodd"
    />
    <path
      fill="#000"
      fillRule="evenodd"
      d="M14.422 8 18 4.422 17.578 4 14 7.578l.422.422Z"
      clipRule="evenodd"
    />
  </svg>
);
export default HasNoPermission;
