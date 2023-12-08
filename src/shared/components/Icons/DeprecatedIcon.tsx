import * as React from 'react';

const DeprecatedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={9} height={8} fill="none" {...props}>
    <path
      fill="#FFB03A"
      d="M7.617 1.632 4.992.132a1 1 0 0 0-.992 0l-2.625 1.5a1 1 0 0 0-.507.868v3a1 1 0 0 0 .5.868l2.625 1.5a1 1 0 0 0 .992 0l2.625-1.5a1 1 0 0 0 .507-.868v-3a1 1 0 0 0-.5-.868Zm-.5 3.868L4.492 7 1.868 5.5v-3L4.492 1l2.625 1.5v3Z"
    />
    <path
      fill="#FFB03A"
      d="M4.992 5.375c0 .666-1 .666-1 0 0-.667 1-.667 1 0ZM3.993 2.25h1v1.875h-1V2.25Z"
    />
  </svg>
);
export default DeprecatedIcon;
