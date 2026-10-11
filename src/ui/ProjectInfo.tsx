import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PROJECT_NAME } from "../config";
import { useText } from "../hooks/useText";
import { useDialog } from "../hooks/useDialog";
import { BrandLogo } from "./BrandLogo";
import { Icon } from "./Icons";
import { ProjectNotes } from "./ProjectNotes";

export function ProjectInfo({ onClose }: { onClose: () => void }) {
  const text = useText();
  const dialog = useRef<HTMLDialogElement>(null);
  const dismiss = () => {
    dialog.current?.close();
    onClose();
  };
  const contents = useDialog(dismiss);
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);

  // Native modality makes the landing inert. The shared guard loops Tab and
  // restores the trigger after React removes the dialog.
  return createPortal(
    <dialog
      ref={dialog}
      className="project-info-dialog"
      aria-labelledby="project-info-heading"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      <div className="project-info-page" ref={contents}>
        <header className="project-info-header">
          <div>
            <span className="project-info-brand">
              <BrandLogo /> {PROJECT_NAME}
            </span>
            <h2 id="project-info-heading">{text.projectInfo}</h2>
          </div>
          <button
            className="icon-button"
            onClick={dismiss}
            aria-label={text.closeInfo}
            autoFocus
          >
            <Icon name="close" />
          </button>
        </header>
        <ProjectNotes />
      </div>
    </dialog>,
    document.body,
  );
}
