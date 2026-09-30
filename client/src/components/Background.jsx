/**
 * Ambient background — extremely subtle HIMA depth.
 * Radial blobs + faint momentum path. Opacity kept very low.
 */
export default function Background() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-blob ambient-blob-a" />
      <div className="ambient-blob ambient-blob-b" />
      <div className="ambient-blob ambient-blob-c" />
      <svg
        className="ambient-path"
        viewBox="0 0 1200 520"
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          <linearGradient id="ambientPath" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7E80D8" stopOpacity="0.16" />
            <stop offset="52%" stopColor="#CD49AA" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#67CECB" stopOpacity="0.14" />
          </linearGradient>
        </defs>
        <path
          d="M-40 430 C 220 380, 320 180, 560 220 S 900 420, 1240 140"
          fill="none"
          stroke="url(#ambientPath)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 10"
        />
        <circle cx="560" cy="220" r="4.5" fill="#CD49AA" opacity="0.28" />
        <circle cx="880" cy="330" r="3.5" fill="#7E80D8" opacity="0.24" />
      </svg>
    </div>
  );
}
