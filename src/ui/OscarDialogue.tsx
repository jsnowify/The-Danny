import { useState } from "react";
import { useText } from "../hooks/useText";
import { useStore } from "../store";
import { OSCAR_CONVERSATION, OSCAR_DECLINE } from "../config/dialogues";
import { ConversationCard } from "./ConversationCard";
import { input } from "../scene/runtime";
import { Icon } from "./Icons";
export function OscarDialogue() {
  const t = useText();
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState<"conversation" | "choice" | "no">(
    "conversation",
  );
  const lines = branch === "no" ? OSCAR_DECLINE : OSCAR_CONVERSATION;
  const line = lines[step];
  const close = () => useStore.setState({ oscarDialogue: false });
  const next = () => {
    if (step < lines.length - 1) setStep(step + 1);
    else if (branch === "conversation") setBranch("choice");
    else close();
  };
  return (
    <ConversationCard label="Conversation with Oscar" line={line} close={close}>
      {branch === "choice" ? (
        <>
          <p className="conversation-question">Seat with Oscar</p>
          <button
            className="primary conversation-next"
            onClick={() => {
              input.held = false;
              input.intent = 0;
              useStore.setState({
                oscarDialogue: false,
                seatedWithOscar: true,
              });
            }}
          >
            Yes
          </button>
          <button
            className="primary secondary"
            onClick={() => {
              setStep(0);
              setBranch("no");
            }}
          >
            No
          </button>
        </>
      ) : (
        <button className="primary conversation-next" onClick={next}>
          {branch === "no" && step === lines.length - 1 ? t.resume : t.continue}
          <Icon name="arrow" />
        </button>
      )}
    </ConversationCard>
  );
}
