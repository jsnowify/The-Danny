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
    let lastTap = { time: -1000, x: 0, y: 0 };
    let tapStart = { time: 0, x: 0, y: 0 };
    let handledDoubleTap = false;
    const toggleView = () => {
      input.wideView = !input.wideView;
      input.held = false;
      input.intent = 0;
      lastTap.time = -1000;
    };
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
        s.companionDialogue ||
        s.seatedWithOscar ||
        s.idleStage === 300 ||
        e.button > 0 ||
        pointerId !== null
      )
        return;
      e.preventDefault();
      canvas.focus();
      pointerId = e.pointerId;
      tapStart = { time: e.timeStamp, x: e.clientX, y: e.clientY };
      const doubleTap =
        tapStart.time - lastTap.time < 320 &&
        Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 24;
      handledDoubleTap = doubleTap;
      if (doubleTap) toggleView();
      else input.held = true;
      aim(e);
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId === pointerId) aim(e);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const now = e.timeStamp;
      if (
        e.type === "pointerup" &&
        now - tapStart.time < 230 &&
        Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) < 16 &&
        input.held
      ) {
        lastTap = { time: now, x: e.clientX, y: e.clientY };
      }
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
      lastTap.time = -1000;
    };
    const lostCapture = (e: PointerEvent) => {
      if (pointerId === e.pointerId) blur();
    };
    const doubleClick = (e: MouseEvent) => {
      const s = useStore.getState();
      if (
        s.phase !== "explore" ||
        s.paused ||
        s.dedicationOpen ||
        s.journalOpen ||
        s.fieldGuideOpen ||
        s.oscarDialogue ||
        s.companionDialogue ||
        s.seatedWithOscar ||
        s.idleStage === 300
      )
        return;
      e.preventDefault();
      if (!handledDoubleTap) toggleView();
      handledDoubleTap = false;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("lostpointercapture", lostCapture);
    canvas.addEventListener("dblclick", doubleClick);
    window.addEventListener("blur", blur);
    window.addEventListener("resize", measure);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("lostpointercapture", lostCapture);
      canvas.removeEventListener("dblclick", doubleClick);
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
