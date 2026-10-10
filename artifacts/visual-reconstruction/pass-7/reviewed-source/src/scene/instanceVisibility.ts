import {
  DirectionalLight,
  Frustum,
  Matrix4,
  Sphere,
  type BufferGeometry,
  type Camera,
  type Scene,
} from "three";
import type { Instance } from "./world";
import { windUniforms } from "../shaders/wind";

/** Conservative visibility packing; authored geometry and LOD budgets stay intact. */
export class InstanceVisibility {
  private view = new Frustum();
  private shadow = new Frustum();
  private matrix = new Matrix4();
  private previous = new Matrix4();
  private previousShadow = new Matrix4();
  private sphere = new Sphere();
  private bounds = new WeakMap<
    BufferGeometry,
    { sphere: Sphere; flex: number; grass: boolean }
  >();
  private sun: DirectionalLight | null = null;
  private shadowEnabled = false;
  private initialized = false;

  update(camera: Camera, scene: Scene, shadows: boolean) {
    camera.updateMatrixWorld();
    this.matrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
    let changed =
      !this.initialized ||
      !this.matrix.equals(this.previous) ||
      this.shadowEnabled !== shadows;
    this.previous.copy(this.matrix);
    this.view.setFromProjectionMatrix(this.matrix);
    // Extra world-space room covers shader wind and subpixel projection rounding.
    for (const plane of this.view.planes) plane.constant += 0.75;
    this.shadowEnabled = shadows;
    if (shadows) {
      if (!this.sun?.parent) {
        this.sun = null;
        scene.traverse((object) => {
          if (object instanceof DirectionalLight && object.castShadow)
            this.sun = object;
        });
      }
      if (this.sun) {
        this.sun.updateMatrixWorld();
        this.sun.target.updateMatrixWorld();
        this.sun.shadow.updateMatrices(this.sun);
        const shadowCamera = this.sun.shadow.camera;
        this.matrix.multiplyMatrices(
          shadowCamera.projectionMatrix,
          shadowCamera.matrixWorldInverse,
        );
        changed ||= !this.matrix.equals(this.previousShadow);
        this.previousShadow.copy(this.matrix);
        this.shadow.setFromProjectionMatrix(this.matrix);
        for (const plane of this.shadow.planes) plane.constant += 0.75;
      } else {
        // Never remove potential casters while the light is being mounted.
        this.shadowEnabled = false;
        changed = true;
      }
    }
    this.initialized = true;
    return changed;
  }

  intersects(
    geometry: BufferGeometry,
    item: Instance,
    yaw: number,
    shadowParticipant: boolean,
  ) {
    let bounds = this.bounds.get(geometry);
    if (!bounds) {
      geometry.computeBoundingSphere();
      const flex = geometry.getAttribute("aFlex");
      const grass = geometry.getAttribute("aGrass");
      let maximum = 0,
        isGrass = false;
      for (let index = 0; index < (flex?.count ?? 0); index++) {
        maximum = Math.max(maximum, flex.getX(index));
        isGrass ||= (grass?.getX(index) ?? 0) > 0.5;
      }
      bounds = {
        sphere: geometry.boundingSphere!.clone(),
        flex: maximum,
        grass: isGrass,
      };
      this.bounds.set(geometry, bounds);
    }
    const center = bounds.sphere.center;
    const x = center.x * item.sx,
      z = center.z * item.sz;
    const sin = Math.sin(yaw),
      cos = Math.cos(yaw);
    this.sphere.center.set(
      item.x + cos * x + sin * z,
      item.y + center.y * item.sy,
      item.z - sin * x + cos * z,
    );
    const scale = Math.max(
      Math.abs(item.sx),
      Math.abs(item.sy),
      Math.abs(item.sz),
    );
    // Bound the same wind/trail displacement used by the existing vertex shader.
    const wind = bounds.flex * Math.max(2, windUniforms.uWind.value) * 0.15;
    const trail = bounds.grass ? bounds.flex ** 2 * 0.34 : 0;
    this.sphere.radius = (bounds.sphere.radius + wind + trail + 0.02) * scale;
    return (
      this.view.intersectsSphere(this.sphere) ||
      (shadowParticipant &&
        (!this.shadowEnabled || this.shadow.intersectsSphere(this.sphere)))
    );
  }
}
