import { useText } from "../hooks/useText";
import { MEMORIES, memoryPreviewUrl } from "../config";
import { useStore } from "../store";
import { memoryUrl } from "../textures/memoryArt";
export function MemorySlots() {
  const TEXT = useText();
  const collected = useStore((s) => s.collected),
    hung = useStore((s) => s.hung);
  return (
    <div className="memory-collection">
      <div
        className="slots"
        role="group"
        aria-label={TEXT.memorySlots}
        tabIndex={0}
      >
        {MEMORIES.map((m, i) => (
          <button
            key={m.id}
            className={`memory-slot ${collected.includes(m.id) ? "filled" : ""} ${hung.includes(m.id) ? "hung" : ""}`}
            disabled={!collected.includes(m.id)}
            aria-label={
              collected.includes(m.id)
                ? `${TEXT.read} ${m.title}${hung.includes(m.id) ? TEXT.hungLabel : ""}`
                : TEXT.emptySlot
            }
            onClick={() => useStore.getState().openMemory(m.id)}
          >
            {collected.includes(m.id) ? (
              <img
                data-memory-photo
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                src={m.imageUrl ? memoryPreviewUrl(m.imageUrl) : memoryUrl(i)}
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = memoryUrl(i);
                }}
                alt=""
              />
            ) : (
              <span />
            )}
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
