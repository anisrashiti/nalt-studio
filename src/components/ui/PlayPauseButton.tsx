type PlayPauseButtonProps = {
  playing: boolean;
  onToggle: () => void;
};

export function PlayPauseButton({ playing, onToggle }: PlayPauseButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Pause showreel" : "Play showreel"}
      className="link-signal relative block size-6 cursor-pointer rounded-full after:absolute after:-inset-2.5 after:content-['']"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-6">
        <circle cx="12" cy="12" r="11.5" stroke="currentColor" />
        {playing ? (
          <path d="M9.5 8V16M14.5 8V16" stroke="currentColor" />
        ) : (
          <path d="M10 8L16 12L10 16V8Z" stroke="currentColor" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
