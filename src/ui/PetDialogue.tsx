import { useEffect } from "react";
import { useText } from "../hooks/useText";
import { useStore } from "../store";
import { COMPANION_BY_ID } from "../config/companions";
import { PET_CONVERSATIONS } from "../config/dialogues";
import { playSound } from "../audio/bridge";
import { ConversationCard } from "./ConversationCard";
import { Icon } from "./Icons";

export function PetDialogue({ id }: { id: string }) {
  const t = useText();
  const step = useStore((s) => s.companionDialogueStep);
  const pet = COMPANION_BY_ID[id];
  const lines = PET_CONVERSATIONS[id];
  const line = lines[step];
  const close = () =>
    useStore.setState({ companionDialogue: null, companionDialogueStep: 0 });
  useEffect(() => {
    if (step > 0 && line.speaker === pet.name)
      playSound(pet.species === "cat" ? "cat" : "dog");
  }, [line, pet, step]);
  return (
    <ConversationCard
      label={`Conversation with ${pet.name}`}
      line={line}
      petId={id}
      close={close}
    >
      <button
        className="primary conversation-next"
        onClick={() => {
          if (step < lines.length - 1)
            useStore.setState({ companionDialogueStep: step + 1 });
          else close();
        }}
      >
        {step === lines.length - 1 ? t.resume : t.continue}
        <Icon name="arrow" />
      </button>
    </ConversationCard>
  );
}
