type TianmuMarkProps = {
  className?: string;
};

export default function TianmuMark({ className = '' }: TianmuMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="2.1" opacity="0.9" />

      <path
        d="M14 36.5H50"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />

      <path
        d="M22 36.5L44 18.5L41 39.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.92"
      />

      <path
        d="M14 42.5C19 39.5 25 45.5 32 42.5C39 39.5 45 45.5 50 42.5"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <path
        d="M16 48C21 45 26 50.5 32 48C38 45.5 43 51 48 48"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.65"
      />
    </svg>
  );
}
