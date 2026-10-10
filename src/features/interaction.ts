import { useStore } from "../store";
export type PrimaryAction = {
  kind: "hang" | "memory" | "oscar" | "animal";
  id?: string;
};
export function primaryAction(): PrimaryAction | null {
  const s = useStore.getState();
  if (
    s.phase !== "explore" ||
    s.paused ||
    s.fieldGuideOpen ||
    s.journalOpen ||
    s.dedicationOpen
  )
    return null;
  if (s.nearTree && s.collected.some((id) => !s.hung.includes(id)))
    return { kind: "hang" };
  if (s.nearMemory) return { kind: "memory", id: s.nearMemory };
  if (s.nearOscar) return { kind: "oscar" };
  if (s.nearCompanion) return { kind: "animal", id: s.nearCompanion };
  return null;
}
export function interact() {
  const a = primaryAction(),
    s = useStore.getState();
  if (!a) return;
  if (a.kind === "hang") s.beginHanging();
  else if (a.kind === "memory") s.openMemory(a.id!);
  else if (a.kind === "oscar") s.talkOscar();
  else s.interactCompanion(a.id!);
}
