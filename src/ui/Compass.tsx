import { useEffect, useRef } from "react";
import { MEMORIES, TEXT } from "../config";
import { useStore } from "../store";
import { traveler } from "../scene/runtime";
import { Icon } from "./Icons";
export function Compass() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const collected = useStore.getState().collected;
      let nearest = Infinity,
        angle = 0;
      for (const m of MEMORIES) {
        if (collected.includes(m.id)) continue;
        const dx = m.position[0] - traveler.x,
          dz = m.position[1] - traveler.z,
          d = dx * dx + dz * dz;
        if (d < nearest) {
          nearest = d;
          angle = Math.atan2(dx, -dz);
        }
      }
      if (ref.current) {
        ref.current.style.opacity =
          nearest !== Infinity && traveler.idle > 4 ? "1" : "0.35";
        ref.current.style.setProperty("--bearing", `${angle}rad`);
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div className="compass" ref={ref} aria-label={TEXT.compassLabel}>
      <span>{TEXT.compassNorth}</span>
      <div className="compass-needle">
        <Icon name="arrow" />
      </div>
    </div>
  );
}
