import { useText } from "../hooks/useText";
import { markActivity } from "../hooks/useActivity";
import { useDialog } from "../hooks/useDialog";
import { BrandLogo } from "./BrandLogo";
export function IdleRest() {
  const t = useText(),
    ref = useDialog(markActivity);
  return (
    <div
      className="overlay idle-rest"
      role="dialog"
      aria-modal="true"
      aria-label={t.pause}
      tabIndex={-1}
      ref={ref}
    >
      <div>
        <BrandLogo />
        <button className="primary" onClick={markActivity}>
          {t.stillHere}
        </button>
      </div>
    </div>
  );
}
