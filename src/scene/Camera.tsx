import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  MathUtils,
  Matrix4,
  OrthographicCamera,
  PerspectiveCamera,
  Vector3,
  type BufferGeometry,
  type Mesh,
} from "three";
import * as damping from "maath/easing";
import { traveler, input } from "./runtime";
import { useStore } from "../store";
import { cameraCalibration } from "./calibration";
import { CAMERA } from "../config";
import { groundHeight } from "../utils/random";
export function Camera() {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const size = useThree((s) => s.size);
  const scratch = useMemo(
    () => ({
      target: new Vector3(0, 1.3, 4),
      focus: new Vector3(0, 1.3, 4),
      position: new Vector3(),
      time: 0,
      finale: 0,
      viewWidth: 0,
      viewHeight: 0,
      viewOffset: 0,
      framingSpan: 0,
      expansion: 0,
      distance: 0,
      landmarkGeometry: null as BufferGeometry | null,
      landmarkPitch: 0,
      landmarkMatrix: new Matrix4(),
      landmarkVertex: new Vector3(),
      landmarkTop: 0,
      landmarkLeft: 0,
      landmarkRight: 0,
      hudWidth: 0,
      hudHeight: 0,
      hudBottom: 0,
      hudLargeText: false,
      hudLanguage: "",
      hudMeasureFrames: 0,
    }),
    [],
  );
  useFrame((_, delta) => {
    const dt = Math.max(0, Math.min(delta, 0.25)),
      s = useStore.getState();
    scratch.time += dt;
    scratch.finale = s.phase === "finale" ? scratch.finale + dt : 0;
    const calibration = import.meta.env.DEV ? cameraCalibration : null;
    const calibrating = calibration?.enabled && s.phase === "explore";
    const exploring =
      s.phase === "explore" || s.phase === "viewer" || s.phase === "hanging";
    const aspect = size.width / size.height;
    const portrait = aspect < 0.75;
    const shortLandscape = size.height < 500 && size.width > size.height;
    const pitch =
      ((calibrating && calibration ? calibration.pitch : CAMERA.pitch) *
        Math.PI) /
      180;
    const sinPitch = Math.sin(pitch),
      cosPitch = Math.cos(pitch);
    const equivalentFov =
      calibrating && calibration ? calibration.fov : CAMERA.fov;
    let framingSpan =
      2 *
      (calibrating && calibration ? calibration.distance : CAMERA.distance) *
      Math.tan((equivalentFov * Math.PI) / 360);
    let lookAhead =
      calibrating && calibration ? calibration.lookAhead : CAMERA.lookAhead;
    const focusHeight =
      calibrating && calibration ? calibration.focusHeight : CAMERA.focusHeight;
    const offset =
      calibrating && calibration
        ? calibration.screenOffsetY
        : CAMERA.screenOffsetY;
    const ground = groundHeight(traveler.x, traveler.z);
    const desiredExpansion =
      s.phase === "explore" && input.wideView ? (portrait ? 0.22 : 0.32) : 0;
    const response = desiredExpansion > scratch.expansion ? 3.2 : 1.65;
    scratch.expansion +=
      (desiredExpansion - scratch.expansion) * (1 - Math.exp(-response * dt));
    if (s.settings.reducedMotion) scratch.expansion = desiredExpansion;
    traveler.cameraExpansion = scratch.expansion;
    let followX =
      traveler.x +
      (calibrating && calibration ? calibration.followX : CAMERA.followX);

    if (exploring && !calibrating) {
      // Fit the existing landmark below the actual HUD. Cache its vertex envelope
      // and measure DOM bounds only on resize, language or text-size changes.
      const limbs = scene.getObjectByName("memory-tree-limbs") as
        Mesh | undefined;
      if (limbs) {
        limbs.updateWorldMatrix(true, false);
        if (
          scratch.landmarkGeometry !== limbs.geometry ||
          scratch.landmarkPitch !== pitch ||
          !scratch.landmarkMatrix.equals(limbs.matrixWorld)
        ) {
          scratch.landmarkGeometry = limbs.geometry;
          scratch.landmarkPitch = pitch;
          scratch.landmarkMatrix.copy(limbs.matrixWorld);
          scratch.landmarkTop = -Infinity;
          scratch.landmarkLeft = Infinity;
          scratch.landmarkRight = -Infinity;
          const vertices = limbs.geometry.getAttribute("position");
          for (let i = 0; i < vertices.count; i++) {
            const vertex = scratch.landmarkVertex
              .fromBufferAttribute(vertices, i)
              .applyMatrix4(limbs.matrixWorld);
            scratch.landmarkTop = Math.max(
              scratch.landmarkTop,
              vertex.y * cosPitch - vertex.z * sinPitch,
            );
            scratch.landmarkLeft = Math.min(scratch.landmarkLeft, vertex.x);
            scratch.landmarkRight = Math.max(scratch.landmarkRight, vertex.x);
          }
        }
      }
      if (
        scratch.hudWidth !== size.width ||
        scratch.hudHeight !== size.height ||
        scratch.hudLargeText !== s.settings.largeText ||
        scratch.hudLanguage !== s.language
      ) {
        scratch.hudMeasureFrames = 3;
      }
      // Canvas resizing and the DOM HUD commit through separate React roots.
      // Refresh for three frames so a breakpoint's previous layout is not cached.
      if (scratch.hudMeasureFrames > 0) {
        const collection = document.querySelector(".memory-collection");
        scratch.hudBottom =
          collection?.getBoundingClientRect().bottom ??
          (size.width < 600 ? 166 : 146);
        if (collection) {
          scratch.hudWidth = size.width;
          scratch.hudHeight = size.height;
          scratch.hudLargeText = s.settings.largeText;
          scratch.hudLanguage = s.language;
          scratch.hudMeasureFrames--;
        }
      }
      if (portrait)
        framingSpan = Math.max(framingSpan, CAMERA.portraitMinWidth / aspect);
      const influence =
        1 -
        MathUtils.smoothstep(
          Math.hypot(traveler.x, traveler.z),
          CAMERA.landmarkRange,
          CAMERA.landmarkFadeRange,
        );
      const footY = portrait
        ? CAMERA.portraitFootY
        : shortLandscape
          ? CAMERA.landscapeFootY
          : CAMERA.clearingFootY;
      if (limbs && influence > 0) {
        const upperDistance =
          scratch.landmarkTop +
          CAMERA.landmarkHeadroom -
          ground * cosPitch +
          traveler.z * sinPitch;
        const safeTop = Math.min(
          0.44,
          (scratch.hudBottom + CAMERA.landmarkMargin) / size.height,
        );
        // The photos hang inside the branch envelope. The extra width leaves
        // their frames and the supporting rocks clear of portrait edges.
        const left = Math.min(scratch.landmarkLeft, traveler.x - 0.65);
        const right = Math.max(scratch.landmarkRight, traveler.x + 0.65);
        followX = MathUtils.lerp(followX, (left + right) / 2, influence);
        const landmarkWidth = right - left + 1.4;
        const fittedSpan = Math.max(
          framingSpan,
          upperDistance / (footY - safeTop),
          landmarkWidth / (aspect * 0.86),
        );
        framingSpan = MathUtils.lerp(framingSpan, fittedSpan, influence);
      }
      // Expand the accepted fitted composition, including the landmark/HUD
      // margins. Never shrink that safety envelope to make travel feel faster.
      framingSpan *= 1 + scratch.expansion;
      if (s.settings.reducedMotion || !scratch.framingSpan)
        scratch.framingSpan = framingSpan;
      else
        damping.damp(scratch, "framingSpan", framingSpan, CAMERA.damping, dt);
      framingSpan = scratch.framingSpan;
      const baseFootY =
        0.5 +
        (CAMERA.lookAhead * sinPitch + focusHeight * cosPitch) / framingSpan -
        offset;
      const composedFootY = MathUtils.lerp(
        portrait ? CAMERA.portraitFootY : baseFootY,
        footY,
        influence,
      );
      lookAhead =
        ((composedFootY - 0.5 + offset) * framingSpan -
          focusHeight * cosPitch) /
        sinPitch;
    }
    if (s.phase === "intro") {
      scratch.target.set(0, 3, 0);
      scratch.position.set(Math.sin(scratch.time * 0.07) * 4, 10, 18);
    } else if (s.phase === "finale" && !s.settings.reducedMotion) {
      const angle = scratch.finale * 0.025,
        distance = CAMERA.distance + Math.min(1, scratch.finale / 12) * 4;
      scratch.target.set(0, 2, 0);
      scratch.position.set(
        Math.sin(angle) * 1.4,
        2 + Math.sin((CAMERA.pitch * Math.PI) / 180) * distance,
        Math.cos((CAMERA.pitch * Math.PI) / 180) * distance,
      );
    } else {
      const height = ground + focusHeight;
      const distance =
        (calibrating && calibration ? calibration.distance : CAMERA.distance) *
        (1 + scratch.expansion);
      scratch.target.set(followX, height, traveler.z - lookAhead);
      scratch.position.set(
        scratch.target.x,
        height + sinPitch * distance,
        scratch.target.z + cosPitch * distance,
      );
    }
    if (
      s.phase === "explore" &&
      s.idleStage >= 45 &&
      !s.settings.reducedMotion
    ) {
      // Pull back along the existing view ray; the idle view never orbits.
      scratch.position
        .sub(scratch.target)
        .multiplyScalar(1.025)
        .add(scratch.target);
    }
    if (
      camera instanceof PerspectiveCamera ||
      camera instanceof OrthographicCamera
    ) {
      const fov = equivalentFov;
      const framingDistance = exploring
        ? framingSpan / (2 * Math.tan((fov * Math.PI) / 360))
        : scratch.position.distanceTo(scratch.target) * (portrait ? 1.24 : 1);
      if (!exploring)
        scratch.framingSpan =
          2 * framingDistance * Math.tan((fov * Math.PI) / 360);
      const halfHeight = framingDistance * Math.tan((fov * Math.PI) / 360);
      const halfWidth = halfHeight * aspect;
      const projectionChanged =
        camera instanceof OrthographicCamera &&
        (Math.abs(camera.top - halfHeight) > 0.000001 ||
          Math.abs(camera.bottom + halfHeight) > 0.000001 ||
          Math.abs(camera.left + halfWidth) > 0.000001 ||
          Math.abs(camera.right - halfWidth) > 0.000001);
      if (
        projectionChanged ||
        camera.userData.verticalFov !== fov ||
        camera.userData.framingDistance !== framingDistance ||
        scratch.viewOffset !== offset ||
        scratch.viewWidth !== size.width ||
        scratch.viewHeight !== size.height
      ) {
        if (camera instanceof PerspectiveCamera) camera.fov = fov;
        else {
          camera.left = -halfWidth;
          camera.right = -camera.left;
          camera.top = halfHeight;
          camera.bottom = -halfHeight;
        }
        camera.userData.verticalFov = fov;
        camera.userData.framingDistance = framingDistance;
        if (offset)
          camera.setViewOffset(
            size.width,
            size.height,
            0,
            size.height * offset,
            size.width,
            size.height,
          );
        else camera.clearViewOffset();
        camera.updateProjectionMatrix();
        scratch.viewOffset = offset;
        scratch.viewWidth = size.width;
        scratch.viewHeight = size.height;
      }
    }
    if (exploring) {
      const distance = scratch.position.distanceTo(scratch.target);
      if (!scratch.distance || s.settings.reducedMotion)
        scratch.distance = distance;
      else damping.damp(scratch, "distance", distance, CAMERA.damping, dt);
      if (s.settings.reducedMotion) scratch.focus.copy(scratch.target);
      else
        damping.damp3(
          scratch.focus,
          scratch.target,
          calibrating && calibration
            ? calibration.focusDamping
            : CAMERA.focusDamping,
          dt,
        );
      // Smooth distance independently of follow translation. Reconstructing a
      // distance from two separately damped points creates feedback during travel.
      camera.position.set(
        scratch.focus.x,
        scratch.focus.y + sinPitch * scratch.distance,
        scratch.focus.z + cosPitch * scratch.distance,
      );
    } else if (s.settings.reducedMotion) {
      camera.position.copy(scratch.position);
      scratch.focus.copy(scratch.target);
    } else {
      damping.damp3(
        camera.position,
        scratch.position,
        calibrating && calibration
          ? calibration.damping
          : s.phase === "explore"
            ? CAMERA.damping
            : 1.8,
        dt,
      );
      damping.damp3(
        scratch.focus,
        scratch.target,
        calibrating && calibration
          ? calibration.focusDamping
          : CAMERA.focusDamping,
        dt,
      );
    }
    camera.lookAt(scratch.focus);
  });
  return null;
}
