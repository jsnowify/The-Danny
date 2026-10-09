import * as Tone from "tone";
import { useStore } from "../store";
import { AMBIENT_TRACK_BPM, AMBIENT_TRACK_URL } from "../config";
import { createMusic } from "./music";
import { createTrack } from "./track";
import { createNature } from "./nature";
import { createSfx } from "./sfx";
import { registerSound } from "./bridge";
let engine: { dispose: () => void } | undefined;
let unlocking: Promise<void> | undefined;

// Prepared synchronously by the gesture handler, including on Safari.
export function prepareAudioContext() {
  if (Tone.getContext().state === "suspended") void Tone.getContext().resume();
}
export function unlockAudio(context?: AudioContext): Promise<void> {
  if (engine) {
    if (context && context !== Tone.getContext().rawContext)
      void context.close();
    prepareAudioContext();
    return Promise.resolve();
  }
  if (unlocking) return unlocking;
  if (context) Tone.setContext(context);
  unlocking = (async () => {
    await Tone.start();
    const limiter = new Tone.Limiter(-1.5).toDestination(),
      master = new Tone.Gain(0).connect(limiter),
      musicBus = new Tone.Gain(1).connect(master),
      natureBus = new Tone.Gain(0).connect(master),
      sfxBus = new Tone.Gain(0.65).connect(master);
    const nature = createNature(natureBus),
      sfx = createSfx(sfxBus);
    let track: ReturnType<typeof createTrack> | undefined;
    let generated: ReturnType<typeof createMusic> | undefined;
    let requested: "track" | "generated" | undefined;
    let disposed = false;
    const setPlayback = (
      musicPlayback: "loading" | "track" | "generated" | "fallback",
    ) => {
      if (useStore.getState().musicPlayback !== musicPlayback)
        useStore.setState({ musicPlayback });
    };
    const sync = () => {
      if (disposed) return;
      const s = useStore.getState();
      if (requested !== s.settings.musicSource) {
        requested = s.settings.musicSource;
        track?.dispose();
        track = undefined;
        generated?.dispose();
        generated = undefined;
        Tone.getTransport().stop();
        Tone.getTransport().bpm.value = AMBIENT_TRACK_BPM;
        Tone.getTransport().timeSignature = 3;
        if (requested === "track" && AMBIENT_TRACK_URL) {
          setPlayback("loading");
          track = createTrack(
            musicBus,
            AMBIENT_TRACK_URL,
            () => {
              if (!disposed) {
                setPlayback("track");
                sync();
              }
            },
            () => {
              if (disposed) return;
              track?.dispose();
              track = undefined;
              generated = createMusic(musicBus);
              setPlayback("fallback");
              sync();
            },
          );
        } else {
          generated = createMusic(musicBus);
          setPlayback(requested === "track" ? "fallback" : "generated");
        }
      }
      const resting = s.phase === "title" || s.phase === "loading";
      const playing = !s.paused && !resting && !document.hidden;
      master.gain.rampTo(
        s.settings.muted || !playing ? 0 : s.settings.volume,
        0.25,
      );
      natureBus.gain.rampTo(
        playing && s.phase !== "dedication" && !s.dedicationOpen ? 0.28 : 0,
        0.3,
      );
      const progress = s.hung.length / 8;
      track?.update(progress, s.phase === "viewer");
      track?.setPlaying(playing);
      generated?.update(progress, s.phase === "viewer");
      const transport = Tone.getTransport();
      if (!playing || !generated) {
        if (transport.state === "started") transport.pause();
      } else if (transport.state !== "started") transport.start();
    };
    registerSound((sound) => {
      const s = useStore.getState();
      if (
        Tone.getContext().state === "running" &&
        !s.paused &&
        !document.hidden
      )
        sfx.play(sound);
    });
    const unsubscribe = useStore.subscribe((s, prior) => {
      if (
        s.settings !== prior.settings ||
        s.hung.length !== prior.hung.length ||
        s.phase !== prior.phase ||
        s.paused !== prior.paused ||
        s.dedicationOpen !== prior.dedicationOpen
      )
        sync();
    });
    const visibility = () => {
      sync();
      if (document.hidden) {
        void (Tone.getContext().rawContext as AudioContext).suspend();
      } else {
        void Tone.getContext()
          .resume()
          .then(sync)
          .catch(() => useStore.setState({ audioFailed: true }));
      }
    };
    document.addEventListener("visibilitychange", visibility);
    const timer = setInterval(nature.update, 250);
    // The diagnostic exposes control state, not audio content, and is absent in production.
    const diagnostics = {
      state: () => ({
        source: useStore.getState().musicPlayback,
        generatedActive: !!generated,
        track: track?.diagnostics() ?? null,
        masterGain: master.gain.value,
        natureGain: natureBus.gain.value,
        contextState: Tone.getContext().state,
      }),
      seek: (seconds: number) => track?.seek(seconds),
    };
    if (import.meta.env.DEV && new URLSearchParams(location.search).has("test"))
      Object.assign(window, { __DANNY_AUDIO__: diagnostics });
    sync();
    engine = {
      dispose() {
        disposed = true;
        clearInterval(timer);
        unsubscribe();
        document.removeEventListener("visibilitychange", visibility);
        registerSound(undefined);
        Tone.getTransport().stop();
        track?.dispose();
        generated?.dispose();
        nature.dispose();
        sfx.dispose();
        [musicBus, natureBus, sfxBus, master, limiter].forEach((node) =>
          node.dispose(),
        );
        if (
          import.meta.env.DEV &&
          Reflect.get(window, "__DANNY_AUDIO__") === diagnostics
        )
          Reflect.deleteProperty(window, "__DANNY_AUDIO__");
        engine = undefined;
      },
    };
  })().catch((error) => {
    unlocking = undefined;
    throw error;
  });
  return unlocking;
}
if (import.meta.hot) import.meta.hot.dispose(() => engine?.dispose());
