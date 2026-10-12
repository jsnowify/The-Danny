import { useCallback, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Plane, Raycaster, Vector2, Vector3 } from "three";
import { useStore } from "../store";
import { input, traveler } from "../scene/runtime";
import { groundHeight, clamp } from "../utils/random";

function movementAllowed() {
  const s = useStore.getState();
  return (
    s.phase === "explore" &&
    !s.paused &&
    !s.dedicationOpen &&
    !s.journalOpen &&
    !s.oscarDialogue &&
    !s.companionDialogue &&
    !s.seatedWithOscar &&
    s.idleStage !== 300 &&
    !document.hidden
  );
}

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
      if (!movementAllowed() || e.button > 0 || pointerId !== null) return;
      e.preventDefault();
      canvas.focus();
      pointerId = e.pointerId;
      input.followCursor = false;
      input.held = true;
      aim(e);
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId === pointerId) aim(e);
      else if (
        e.pointerType === "mouse" &&
        e.buttons === 0 &&
        movementAllowed()
      ) {
        input.followCursor = true;
        aim(e);
      }
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      input.held = false;
      input.intent = 0;
      pointerId = null;
      // Mouse movement needs no held button. After a click, walk to the
      // last sampled ground point; touch still ends when the finger lifts.
      input.followCursor =
        e.type === "pointerup" &&
        e.pointerType === "mouse" &&
        movementAllowed();
      if (input.followCursor) aim(e);
      if (canvas.hasPointerCapture(e.pointerId))
        canvas.releasePointerCapture(e.pointerId);
    };
    const blur = () => {
      input.held = false;
      input.followCursor = false;
      input.intent = 0;
      pointerId = null;
    };
    const lostCapture = (e: PointerEvent) => {
      if (pointerId === e.pointerId) blur();
    };
    const leave = () => {
      input.followCursor = false;
      if (!input.held) input.intent = 0;
    };
    const key = (e: KeyboardEvent) => {
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowLeft",
          "ArrowDown",
          "ArrowRight",
        ].includes(e.code)
      )
        leave();
    };
    const visibility = () => {
      if (document.hidden) blur();
    };
    const unsubscribe = useStore.subscribe(() => {
      if (!movementAllowed()) blur();
    });
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("lostpointercapture", lostCapture);
    window.addEventListener("blur", blur);
    window.addEventListener("keydown", key);
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("lostpointercapture", lostCapture);
      window.removeEventListener("blur", blur);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", visibility);
      unsubscribe();
      observer.disconnect();
      blur();
    };
  }, [gl, scratch, updateAim]);
  // Held touch/mouse input steers continuously. Hover samples a fixed world
  // destination only when the cursor moves, so a parked cursor lets Danny stop.
  useFrame(() => {
    if (input.held) updateAim();
  });
}
