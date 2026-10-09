import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Plane, Raycaster, Vector2, Vector3 } from "three";
import { useStore } from "../store";
import { input } from "../scene/runtime";
export function usePlayerControls() {
  const { gl, camera } = useThree();
  const scratch = useMemo(
    () => ({
      ray: new Raycaster(),
      pointer: new Vector2(),
      plane: new Plane(new Vector3(0, 1, 0), 0),
      hit: new Vector3(),
    }),
    [],
  );
  useEffect(() => {
    const canvas = gl.domElement;
    let pointerId: number | null = null;
    const aim = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      scratch.pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        (-(e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      scratch.ray.setFromCamera(scratch.pointer, camera);
      if (scratch.ray.ray.intersectPlane(scratch.plane, scratch.hit)) {
        input.targetX = scratch.hit.x;
        input.targetZ = scratch.hit.z;
      }
    };
    const down = (e: PointerEvent) => {
      const s = useStore.getState();
      if (
        s.phase !== "explore" ||
        s.paused ||
        s.dedicationOpen ||
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
      pointerId = null;
      if (canvas.hasPointerCapture(e.pointerId))
        canvas.releasePointerCapture(e.pointerId);
    };
    const blur = () => {
      input.held = false;
      pointerId = null;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("lostpointercapture", blur);
    window.addEventListener("blur", blur);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("lostpointercapture", blur);
      window.removeEventListener("blur", blur);
      input.held = false;
    };
  }, [gl, camera, scratch]);
}
