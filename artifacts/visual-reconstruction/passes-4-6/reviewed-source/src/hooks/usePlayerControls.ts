import { useCallback, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Plane, Raycaster, Vector2, Vector3 } from "three";
import { useStore } from "../store";
import { input, traveler } from "../scene/runtime";
import { groundHeight, clamp } from "../utils/random";
export function usePlayerControls() {
  const { gl, camera } = useThree();
  const scratch = useMemo(
    () => ({
      ray: new Raycaster(),
      pointer: new Vector2(),
      plane: new Plane(new Vector3(0, 1, 0), 0),
      hit: new Vector3(),
      player: new Vector3(),
      rect: { left: 0, top: 0, width: 1, height: 1 },
    }),
    [],
  );
  const updateAim = useCallback(() => {
    if (!input.held) return;
    const rect = scratch.rect;
    scratch.pointer.set(
      ((input.clientX - rect.left) / rect.width) * 2 - 1,
      1 - ((input.clientY - rect.top) / rect.height) * 2,
    );
    scratch.player
      .set(traveler.x, groundHeight(traveler.x, traveler.z), traveler.z)
      .project(camera);
    input.distance = Math.hypot(
      ((scratch.pointer.x - scratch.player.x) * rect.width) / 2,
      ((scratch.pointer.y - scratch.player.y) * rect.height) / 2,
    );
    const deadZone = Math.max(10, Math.min(rect.width, rect.height) * 0.028);
    const normalized = clamp(
      (input.distance - deadZone) /
        (Math.min(rect.width, rect.height) * 0.48 - deadZone),
      0,
      1,
    );
    input.intent = normalized * normalized * (3 - 2 * normalized);
    scratch.plane.constant = -groundHeight(traveler.x, traveler.z);
    scratch.ray.setFromCamera(scratch.pointer, camera);
    // Refine against the same height field that grounds the feet and plants.
    // At this shallow terrain slope four iterations converge below a pixel.
    for (let i = 0; i < 4; i++) {
      if (!scratch.ray.ray.intersectPlane(scratch.plane, scratch.hit)) return;
      scratch.plane.constant = -groundHeight(scratch.hit.x, scratch.hit.z);
    }
    input.targetX = scratch.hit.x;
    input.targetZ = scratch.hit.z;
  }, [camera, scratch]);
  useEffect(() => {
    const canvas = gl.domElement;
    let pointerId: number | null = null;
    const measure = () => (scratch.rect = canvas.getBoundingClientRect());
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    measure();
    const aim = (e: PointerEvent) => {
      input.clientX = e.clientX;
      input.clientY = e.clientY;
      updateAim();
    };
    const down = (e: PointerEvent) => {
      const s = useStore.getState();
      if (
        s.phase !== "explore" ||
        s.paused ||
        s.dedicationOpen ||
        s.journalOpen ||
        s.fieldGuideOpen ||
        s.oscarDialogue ||
        s.idleStage === 300 ||
        e.button > 0 ||
        pointerId !== null
      )
        return;
      e.preventDefault();
      canvas.focus();
      pointerId = e.pointerId;
      input.held = true;
      aim(e);
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId === pointerId) aim(e);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      input.held = false;
      input.intent = 0;
      pointerId = null;
      if (canvas.hasPointerCapture(e.pointerId))
        canvas.releasePointerCapture(e.pointerId);
    };
    const blur = () => {
      input.held = false;
      input.intent = 0;
      pointerId = null;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("lostpointercapture", blur);
    window.addEventListener("blur", blur);
    window.addEventListener("resize", measure);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("lostpointercapture", blur);
      window.removeEventListener("blur", blur);
      window.removeEventListener("resize", measure);
      observer.disconnect();
      input.held = false;
      input.intent = 0;
    };
  }, [gl, scratch, updateAim]);
  // A still held cursor continues to steer as the following camera reveals ground.
  useFrame(updateAim);
}
