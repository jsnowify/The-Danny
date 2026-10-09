import { useMemo } from "react";
import { MEMORIES, TEXT } from "../config";
import { useStore } from "../store";
import { memoryUrl } from "../textures/memoryArt";
export function MemorySlots() {
  const collected = useStore((s) => s.collected),
    hung = useStore((s) => s.hung);
  const urls = useMemo(() => MEMORIES.map((_, i) => memoryUrl(i)), []);
  return (
    <div className="memory-collection">
      <div className="slots">
        {MEMORIES.map((m, i) => (
          <button
            key={m.id}
            className={`memory-slot ${collected.includes(m.id) ? "filled" : ""} ${hung.includes(m.id) ? "hung" : ""}`}
            disabled={!collected.includes(m.id)}
            aria-label={
              collected.includes(m.id)
                ? `${TEXT.read} ${m.caption}${hung.includes(m.id) ? TEXT.hungLabel : ""}`
                : TEXT.emptySlot
            }
            onClick={() => useStore.getState().openMemory(m.id)}
          >
            {collected.includes(m.id) ? <img src={urls[i]} alt="" /> : <span />}
          </button>
        ))}
      </div>
      <span className="memory-counter">
        {collected.length} <span>/</span> {MEMORIES.length}
        <span className="counter-label"> {TEXT.found}</span>
      </span>
    </div>
  );
}
