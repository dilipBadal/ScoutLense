import { useState } from "react";
import portraits from "../data/playerFaces.json";

const faces: Record<string, { name: string; src: string }> = portraits;

export function PlayerAvatar({
  id,
  name,
  size = 48,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const face = faces[id];
  const src = face?.name === name ? face.src : null;
  const initials = name.split(/\s+/).map((part) => part[0]).filter(Boolean);
  return (
    <span
      className="player-avatar"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {src && failedSrc !== src ? (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span>{initials[0]}{initials.length > 1 ? initials.at(-1) : ""}</span>
      )}
    </span>
  );
}
