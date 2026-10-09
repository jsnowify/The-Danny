import { TEXT } from "../config";
import { BrandLogo } from "./BrandLogo";
export function LoadingScreen({ progress = 0 }: { progress?: number }) {
  return (
    <div className="loading-screen" role="status" aria-label={TEXT.growLabel}>
      <div className="loading-emblem">
        <BrandLogo />
      </div>
      <span>{TEXT.growing}</span>
      <div className="loading-track">
        <i style={{ width: `${Math.max(8, progress)}%` }} />
      </div>
    </div>
  );
}
