export type DialogueLine = { speaker: string; text: string };

export const OSCAR_CONVERSATION: DialogueLine[] = [
  { speaker: "Oscar", text: "Oy, bro! Naa na lagi ka diri." },
  { speaker: "Danny", text: "Oy, bro! Kumusta? Lagi, kalit ra gyud kaayo." },
  {
    speaker: "Oscar",
    text: "Okay ra man ko, bro. Unya, kumusta man sila sa ubos? Kumusta akong anak, si Jaya?",
  },
  { speaker: "Danny", text: "Okay na sila, bro. Si Wowex, dako na." },
  { speaker: "Oscar", text: "Maayo diay. Diri sa ta, bro. Lingkod sa." },
];

export const OSCAR_DECLINE: DialogueLine[] = [
  {
    speaker: "Danilo",
    text: "Magsuroy-suroy sa guro ko, bro. Basin naa pay mapanday diri. Hahaha!",
  },
  {
    speaker: "Oscar",
    text: "Hahaha! Sige, bro. Ingna lang ko kay tabangan tikag tambay. Hahaha!",
  },
  { speaker: "Danilo", text: "Hahaha! Sige, bro." },
];

export const PET_CONVERSATIONS: Record<string, DialogueLine[]> = {
  hoshi: [
    { speaker: "Hoshi", text: "meow" },
    {
      speaker: "Danilo",
      text: "Hoshi, gimingaw si Kuya Wawa ug Mama Lodge nimo.",
    },
    { speaker: "Hoshi", text: "Meow meow" },
  ],
  snowa: [
    { speaker: "Snowa", text: "Zzzz meowwww" },
    { speaker: "Danilo", text: "Oy, ang lalab ni Lodge! Snowa, dali diri." },
    { speaker: "Snowa", text: "Meeeeeowwwww" },
  ],
  thoma: [
    { speaker: "Thoma", text: "Meoww" },
    { speaker: "Danilo", text: "Thomaaaa, ali diri! Gimingaw sila nimo." },
    { speaker: "Thoma", text: "Meow" },
  ],
  star: [
    { speaker: "Star", text: "Meeeooww" },
    {
      speaker: "Danilo",
      text: "Mama Tar, naa lagi ka diri! Kumusta sila didto?",
    },
    { speaker: "Star", text: "Meowww" },
  ],
  simba: [
    { speaker: "Simba", text: "Meeeeeeowwwwww" },
    { speaker: "Danilo", text: "Oy, baby ni Kuya Wawa! Simbaaaa!" },
    { speaker: "Simba", text: "meow meow" },
  ],
  max: [
    { speaker: "Max", text: "Arrffff arff" },
    { speaker: "Danilo", text: "Max, nganong naa man ka diri? Naunsa man ka?" },
    { speaker: "Max", text: "Arf arf arff arff" },
    { speaker: "Danilo", text: "Nah, naunsa man ni, oy?" },
    { speaker: "Max", text: "arf arf" },
    { speaker: "Danilo", text: "Ali diri. Pakan-on tamo unya, ha!" },
    { speaker: "Max", text: "arf" },
  ],
  // Keep the saved pet ID while using the owner's requested spelling on screen.
  doreamon: [
    { speaker: "Doraemon", text: "Arf!" },
    {
      speaker: "Danilo",
      text: "Among palanggang Doraemon, kumusta naman tawon ka? Gimingaw na si Kuya Wawa nimo.",
    },
    { speaker: "Doraemon", text: "Arf arf arf" },
  ],
  nano: [
    { speaker: "Nano", text: "Arf arf arf" },
    {
      speaker: "Danilo",
      text: "Oy, Nano. Pasayloa mi, ha. Wala gyud mi mabuhat ato.",
    },
    { speaker: "Nano", text: "arf arf" },
  ],
};
