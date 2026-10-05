import { capabilityVisualStates } from "@/lib/data/capabilities";

type CapabilityVisualProps = { state: number; shared?: boolean; className?: string };

export function CapabilityVisual({ state, shared = false, className }: CapabilityVisualProps) {
  const geometry = capabilityVisualStates[state];
  return (
    <svg
      className={className}
      viewBox="0 0 600 440"
      aria-hidden="true"
      focusable="false"
      data-system-visual=""
      data-system-shared={shared ? "true" : "false"}
      fill="none"
      style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}
    >
      {geometry.links.map((path, index) => <path key={index} data-system-links="" d={path} stroke="#AAA69F" strokeWidth="1" opacity={geometry.linkOpacity} />)}
      {geometry.units.map((unit, index) => (
        <g key={index} data-system-unit="" transform={`translate(${unit.x} ${unit.y}) scale(${unit.scaleX} ${unit.scaleY})`} opacity={unit.opacity}>
          <rect data-system-frame="" x="-80" y="-56" width="160" height="112" rx={unit.radius} ry={Math.min(56, unit.radius)} fill="#080808" stroke="#F4EFE7" strokeWidth="1.15" vectorEffect="non-scaling-stroke" />
          <g data-system-plane-detail="" opacity={state === 0 ? 0.65 : 0}>
            <path d="M-62-37H62M-20-37V36M-62-19H-33M-62-5H-33M-62 9H-33M-62 36H62" stroke="#AAA69F" strokeWidth="0.85" vectorEffect="non-scaling-stroke" />
            <rect x="-5" y="-20" width="67" height="41" stroke="#AAA69F" strokeWidth="0.85" vectorEffect="non-scaling-stroke" />
          </g>
          <g data-system-slot-detail="" opacity={state === 1 ? 0.7 : 0}>
            <path d="M-48-30H48M-48 0H48M-48 30H8" stroke="#AAA69F" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>
          <g data-system-state-detail="" opacity={state === 2 ? 0.75 : 0}>
            <ellipse cx="0" cy="0" rx="48" ry="34" stroke="#AAA69F" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path d={index === 1 ? "M-14 0H14M0-10V10" : "M-14 0H14"} stroke="#F4EFE7" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
          </g>
          <g data-system-stack-detail="" opacity={state === 3 ? 0.7 : 0}>
            <path d="M-57-28V28M-21-28V28M15-28V28M51-28V28" stroke="#AAA69F" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>
        </g>
      ))}
      <g data-system-platform-detail="" opacity={state === 3 ? 0.7 : 0} stroke="#AAA69F" strokeWidth="1">
        <path d="M400 112H454M400 220H488M400 328H454M92 112V328M92 112H128M92 220H128M92 328H128" />
        <path d="M450 108V116M484 216V224M450 324V332" stroke="#F4EFE7" />
      </g>
      <rect data-system-marker="" x="-3" y="-3" width="6" height="6" transform={`translate(${geometry.marker.x} ${geometry.marker.y})`} fill="#FF4B00" />
    </svg>
  );
}
