type ScoopTraceProps = {
  className?: string;
};

export function ScoopTrace({ className = '' }: ScoopTraceProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="scoop-trace-line scoop-trace-line-a"
        d="M51 172c-5-60 39-119 102-129 66-11 128 28 140 89 13 66-29 128-91 143-65 16-130-21-149-82"
        pathLength="1"
      />
      <path
        className="scoop-trace-line scoop-trace-line-b"
        d="M83 174c-2-43 29-84 75-92 47-8 91 20 102 63 12 47-18 94-63 106-48 12-96-14-111-58"
        pathLength="1"
      />
      <path
        className="scoop-trace-line scoop-trace-line-c"
        d="M116 171c0-26 19-50 47-55 29-5 57 12 64 38 8 29-10 59-38 67-29 8-59-8-69-35"
        pathLength="1"
      />
      <circle cx="69" cy="215" r="4" className="scoop-trace-dot" />
    </svg>
  );
}
