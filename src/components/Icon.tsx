type IconName = "play" | "pause" | "reset" | "wave" | "speaker" | "activity"

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths = {
    play: <path d="m8 5 11 7-11 7V5Z" />,
    pause: (
      <>
        <path d="M8 5v14M16 5v14" />
      </>
    ),
    reset: (
      <>
        <path d="M4 8V4m0 0h4M4 4l3.2 3.2A7 7 0 1 1 5 15" />
      </>
    ),
    wave: <path d="M3 12h3l2.2-6 4 12 3.2-9 2 3H21" />,
    speaker: (
      <>
        <path d="M6 10H3v4h3l5 4V6l-5 4Z" />
        <path d="M15 9a4 4 0 0 1 0 6m2.5-8.5a8 8 0 0 1 0 11" />
      </>
    ),
    activity: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M5.6 5.6a9 9 0 0 0 0 12.8m12.8 0a9 9 0 0 0 0-12.8M8.5 8.5a5 5 0 0 0 0 7m7 0a5 5 0 0 0 0-7" />
      </>
    ),
  }
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={name === "play" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}