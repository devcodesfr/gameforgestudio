import type { SVGProps } from "react";

export function ButtonzSidebarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5.5 5.25h13a2.75 2.75 0 0 1 2.75 2.75v6.25A2.75 2.75 0 0 1 18.5 17H11l-4.75 3.5V17h-.75a2.75 2.75 0 0 1-2.75-2.75V8A2.75 2.75 0 0 1 5.5 5.25Z" />
      <path d="M6.25 9.25h3.25l1.25-1.25" />
      <path d="M6.25 12h4.25l1.25-1.25" />
      <path d="M17.75 9.25h-3.25l-1.25-1.25" />
      <path d="M17.75 12h-4.25l-1.25 1.25" />
      <circle cx="10.75" cy="8" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="11.75" cy="10.75" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="13.25" cy="8" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14.25" r="0.55" fill="currentColor" stroke="none" />
    </svg>
  );
}
