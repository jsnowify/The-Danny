import { useText } from "../hooks/useText";
import { BrandLogo } from "./BrandLogo";
import { useEffect, useState } from "react";
export function LoadingScreen({ progress = 0 }: { progress?: number }) {
  const TEXT = useText();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timeout = window.setTimeout(() => setSlow(true), 30000);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div className="loading-screen" role="status" aria-label={TEXT.growLabel}>
      <div className="loading-emblem">
        <BrandLogo />
      </div>
      <span>{TEXT.growing}</span>
      <div className="loading-track">
        <i style={{ width: `${Math.max(8, progress)}%` }} />
      </div>
      {slow && (
        <>
          <p role="alert">{TEXT.loadingSlow}</p>
          <button className="primary" onClick={() => location.reload()}>
            {TEXT.retry}
          </button>
        </>
      )}
    </div>
  );
}
