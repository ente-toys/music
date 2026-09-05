import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import type { Visualizer as MilkdropVisualizer } from 'butterchurn';

type Track = { id: string; title: string; artist: string; url: string };
const { tracks } = (await fetch('/tracks.json').then((response) =>
  response.json(),
)) as { tracks: Track[] };
const crossfadeSeconds = 0.1;
const defaultVisualization = 'Flexi - alien fish pond';
const harshVisualizations = new Set([
  'Adam Eatit Mashup FX 2 martin - disco mix + Lodus + Geiss + Ludicrous speed + Aderrasi 2_1',
  'Adam Eatit Mashup FX 2 martin - disco mix + Lodus + Geiss + Ludicrous speed + Baked Ft another AdamFX Mashup 7_1',
  'Adam Eatit Mashup FX 2 martin - disco mix + Lodus + Geiss + Ludicrous speed + Eos Ft Flexi n Hexocollie + Baked + Santa Fucking Claus',
  'Aderrasi - Contortion (Escher′s Tunnel Mix)',
  'Aderrasi - Contortion (Wide Twist Mix)',
  'Aderrasi - Mother Of Pearl - mash0000 - how to piss off your eyes',
  'Cope - The Neverending Explosion of Red Liquid Fire',
  'Eo.S. + Geiss - glowsticks v2 02 (Relief Mix)',
  'Eo.S. + flexi - glowsticks v2 05 and proton lights (+Krash′s beat code) _Phat_remix02b + illumination (Stahl′s Mix)',
  'Eo.S. - glowsticks v2 03 music',
  'Eo.S. - glowsticks v2 05 and proton lights (+Krash′s beat code) _Phat_remix02b',
  'Eo.S. - glowsticks v2 05 and proton lights (+Krash′s beat code) _Phat_remix07 recursive demons',
  'Flexi + Martin - tunnel of supraschismatika',
  'Flexi - reality tunnel',
  'Flexi, Martin, Phat, Zylot + Eo.S - one way trip trap proof of concept [epileptic zoom tunnel edit]',
  'Geiss - 3 layers (Tunnel Mix)',
  'GreatWho - Lasershow',
  'Idiot - Marphets Surreal Dream (Hypnotic Spiral Mix)',
  'Rovastar + Geiss - Hyperspace - kaleidoscope',
  'Rovastar - Explosive Minds',
  'Rovastar - Hyperspace',
  'Studio Music and Unchained - Rapid Alteration',
  'TEcHNO & SandStorm - Psychodelic Highway',
  '_Geiss - Explosion Mod 2b',
  'adam eatit fx 2 martin - disco mix, lodus, geiss, ludicrous speed,flexi, aderrasi n hexcollie',
  'amandio c - flashy thing',
  'baked - Chinese Fingerbang (cao ni ma =]) - PieturP colors - Bitcore speed tweak',
  'flexi - hyperspaceflight (bn cn Jelly 4)',
  'martin - cope - laser dome',
  'martin - into the fireworks',
  'martin - ludicrous speed',
  'martin - mandelbox explorer - high speed demo version',
  'martin - tunnel race',
  'martin - violet flash',
  'phat + Eo.S. - Bass_responce_Red_Movements_Disorienting nebula3',
]);
const skins = [
  { value: 'classic', label: 'Classic' },
  { value: 'metal', label: 'Metal' },
] as const;
const visualizationIntervals = [
  [5, '5 seconds'],
  [15, '15 seconds'],
  [30, '30 seconds'],
  [60, '60 seconds'],
  [300, '5 minutes'],
  [600, '10 minutes'],
  [0, 'Never'],
] as const;
const iconPaths = {
  close: 'M6 6l12 12M18 6 6 18',
  loop: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3',
  minimize: 'M5 12h14',
  next: 'M18 5v14M5 6l9 6-9 6z',
  pause: 'M8 5v14M16 5v14',
  play: 'M8 5l11 7-11 7z',
  previous: 'M6 5v14M19 6l-9 6 9 6z',
  restore: 'M14 3h7v7m0-7L11 13M10 5H5v14h14v-5',
  settings:
    'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
} as const;
type Skin = (typeof skins)[number]['value'];
type VisualizationInterval = (typeof visualizationIntervals)[number][0];
type SavedState = {
  track: number;
  time: number;
  volume: number;
  skin: Skin;
  looping: boolean;
  minimized: boolean;
  visualization: string;
  visualizationInterval: VisualizationInterval;
  visualizerPaused: boolean;
};
const savedState = JSON.parse(
  localStorage.getItem('ente-player-state') ?? '{}',
) as Partial<SavedState>;

function Icon({ name }: { name: keyof typeof iconPaths }) {
  return (
    <svg className="button-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  );
}

function SubmissionButton() {
  return (
    <a
      className="submission-button"
      href="mailto:music@ente.com?subject=Submission%20to%20music.ente.com"
      aria-label="Submit your song by email"
      title="Submit your song"
    >
      <span>Submit your song</span>
    </a>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`;
}

function SegmentClock({ seconds }: { seconds: number }) {
  const time = formatTime(seconds);
  const segments = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
  const paths = [
    'M5 1h18l-4 4H9z', 'M24 2v20l-4-3V6z',
    'M24 24v20l-4-4V27z', 'M5 45l4-4h10l4 4z',
    'M4 24l4 3v13l-4 4z', 'M4 2l4 4v13l-4 3z',
    'M5 23l4-3h10l4 3-4 3H9z',
  ];
  return (
    <span className="segment-clock" role="img" aria-label={time}>
      {[...time].map((digit, index) => (
        <svg key={index} viewBox={digit === ':' ? '0 0 10 46' : '0 0 28 46'} aria-hidden="true">
          {digit === ':' ? <path d="M3 15h4v4H3zm0 15h4v4H3z" /> : paths.map((path, segment) => (
            <path key={segment} d={path} opacity={segments[Number(digit)].includes('abcdefg'[segment]) ? 1 : 0.07} />
          ))}
        </svg>
      ))}
    </span>
  );
}

function sourceFor(track: Track) {
  const url = new URL(track.url);
  return url.hostname === 'music.ente.com' ? url.pathname : track.url;
}

function sliderStyle(value: number, max: number) {
  return { '--progress': `${(value / max) * 100}%` } as CSSProperties;
}

function restorePosition(element: HTMLElement, key: string) {
  const position = localStorage.getItem(key);
  if (!position) return;
  const [left, top] = position.split(',').map(Number);
  if (!Number.isFinite(left) || !Number.isFinite(top)) return;
  element.style.left = `${Math.min(left, Math.max(0, innerWidth - element.offsetWidth))}px`;
  element.style.top = `${Math.min(top, Math.max(0, innerHeight - element.offsetHeight))}px`;
  element.style.transform = 'none';
}

export default function Home() {
  const analyserRef = useRef<AnalyserNode>(null);
  const audioARef = useRef<HTMLAudioElement>(null);
  const audioBRef = useRef<HTMLAudioElement>(null);
  const activeAudioRef = useRef<0 | 1>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<AudioContext>(null);
  const crossfadingRef = useRef(false);
  const dragRef = useRef({
    pointerId: -1,
    offsetX: 0,
    offsetY: 0,
    target: null as HTMLElement | null,
  });
  const meterRef = useRef<HTMLDivElement>(null);
  const gainRefs = useRef<[GainNode | null, GainNode | null]>([null, null]);
  const initialVisualizationRef = useRef(
    savedState.visualization ?? defaultVisualization,
  );
  const lastVisualizerTapRef = useRef(0);
  const playerRef = useRef<HTMLElement>(null);
  const settingsRef = useRef<HTMLElement>(null);
  const presetsRef = useRef<Record<string, unknown>>({});
  const presetLoadedRef = useRef(false);
  const playingRef = useRef(false);
  const restoreTimeRef = useRef(Math.max(0, savedState.time ?? 0));
  const seekingRef = useRef(false);
  const transitionTimerRef = useRef(0);
  const visualizerLoadingRef = useRef(false);
  const visualizerRef = useRef<MilkdropVisualizer>(null);
  const [index, setIndex] = useState(
    Math.min(tracks.length - 1, Math.max(0, savedState.track ?? 0)),
  );
  const [playing, setPlaying] = useState(false);
  const [visualizerReady, setVisualizerReady] = useState<boolean | null>(null);
  const [visualizations, setVisualizations] = useState([defaultVisualization]);
  const [visualization, setVisualization] = useState(
    initialVisualizationRef.current,
  );
  const [visualizationInterval, setVisualizationInterval] =
    useState<VisualizationInterval>(savedState.visualizationInterval ?? 15);
  const [visualizerPaused, setVisualizerPaused] = useState(savedState.visualizerPaused ?? false);
  const [elapsed, setElapsed] = useState(restoreTimeRef.current);
  const [duration, setDuration] = useState(restoreTimeRef.current);
  const [volume, setVolume] = useState(savedState.volume ?? 72);
  const [skin, setSkin] = useState<Skin>(savedState.skin ?? 'classic');
  const [looping, setLooping] = useState(savedState.looping ?? true);
  const [minimized, setMinimized] = useState(savedState.minimized ?? false);
  const [minimizing, setMinimizing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const track = tracks[index];

  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      restorePosition(playerRef.current!, 'ente-player-position'),
    );
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const frame = requestAnimationFrame(() =>
      restorePosition(settingsRef.current!, 'ente-settings-position'),
    );
    return () => cancelAnimationFrame(frame);
  }, [settingsOpen]);

  useEffect(() => {
    localStorage.setItem(
      'ente-player-state',
      JSON.stringify({
        track: index,
        time: Math.floor(elapsed),
        volume,
        skin,
        looping,
        minimized,
        visualization,
        visualizationInterval,
        visualizerPaused,
      } satisfies SavedState),
    );
  }, [
    index,
    Math.floor(elapsed),
    volume,
    skin,
    looping,
    minimized,
    visualization,
    visualizationInterval,
    visualizerPaused,
  ]);

  const connectAudio = useCallback(async (resume = true) => {
    const audio = [audioARef.current, audioBRef.current];
    if (!audio[0] || !audio[1]) return;
    if (!contextRef.current) {
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;
      audio.forEach((element, slot) => {
        const gain = context.createGain();
        gain.gain.value = slot === 0 ? 1 : 0;
        context
          .createMediaElementSource(element!)
          .connect(gain)
          .connect(analyser);
        gainRefs.current[slot] = gain;
      });
      analyser.connect(context.destination);
      analyserRef.current = analyser;
      contextRef.current = context;
    }
    if (!visualizerRef.current && !visualizerLoadingRef.current) {
      visualizerLoadingRef.current = true;
      void Promise.all([
        import('butterchurn'),
        import('butterchurn-presets'),
        import('butterchurn-presets/lib/butterchurnPresetsExtra.min.js'),
        import('butterchurn-presets/lib/butterchurnPresetsExtra2.min.js'),
        import('butterchurn-presets/lib/butterchurnPresetsMD1.min.js'),
      ])
        .then(([{ default: butterchurn }, ...presetPacks]) => {
          const visualizer = butterchurn.createVisualizer(
            contextRef.current!,
            canvasRef.current!,
            {
              width: innerWidth,
              height: innerHeight,
              pixelRatio: Math.min(devicePixelRatio, 2),
            },
          );
          visualizer.connectAudio(analyserRef.current!);
          visualizerRef.current = visualizer;
          const presets = Object.assign(
            {},
            ...presetPacks.map(({ default: pack }) => pack.getPresets()),
          );
          for (const name of harshVisualizations) delete presets[name];
          presetsRef.current = presets;
          setVisualizations(Object.keys(presets).sort());
          const initialVisualization = presets[initialVisualizationRef.current]
            ? initialVisualizationRef.current
            : defaultVisualization;
          setVisualization(initialVisualization);
          visualizer.loadPreset(presets[initialVisualization], 0);
          setVisualizerReady(true);
        })
        .catch((reason) => {
          console.error('MilkDrop initialization failed', reason);
          setVisualizerReady(false);
        })
        .finally(() => {
          visualizerLoadingRef.current = false;
        });
    }
    if (resume && contextRef.current.state === 'suspended')
      await contextRef.current.resume();
  }, []);

  useEffect(() => {
    const audio = audioARef.current!;
    audio.src = sourceFor(tracks[index]);
    audio.load();
  }, []);

  useEffect(() => {
    void connectAudio(false);
  }, [connectAudio]);

  useEffect(() => {
    if (crossfadingRef.current) return;
    const standby = activeAudioRef.current
      ? audioARef.current!
      : audioBRef.current!;
    const source = sourceFor(
      tracks[looping ? index : (index + 1) % tracks.length],
    );
    if (standby.getAttribute('src') === source) return;
    standby.src = source;
    standby.load();
  }, [index, looping]);

  useEffect(() => {
    if (visualizerReady === null) return;
    const analyser = analyserRef.current!;
    const bars = Array.from(meterRef.current!.children) as HTMLElement[];
    const frequencies = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;
    let pulse = 0;
    const resize = () =>
      visualizerRef.current?.setRendererSize(innerWidth, innerHeight, {
        pixelRatio: Math.min(devicePixelRatio, 2),
      });
    const render = () => {
      analyser.getByteFrequencyData(frequencies);
      const live = playingRef.current;
      const activeBins = frequencies.length / 2;
      let level = 0;
      for (let index = 0; index < activeBins; index++)
        level += frequencies[index];
      const target = live ? level / activeBins / 255 : 0;
      pulse += (target - pulse) * (target > pulse ? 0.45 : 0.12);
      const canvas = canvasRef.current!;
      canvas.style.filter = live
        ? `brightness(${0.9 + pulse * 3.2}) saturate(${1 + pulse * 2.4})`
        : 'brightness(0.55) saturate(0.65) blur(1.5px)';
      canvas.style.transform = `scale(${1 + pulse * 0.1})`;
      bars.forEach((bar, index) => {
        const bucket = Math.floor(
          ((index + 1) / bars.length) ** 2 * (activeBins - 1),
        );
        bar.style.height = `${live ? Math.max(12, (frequencies[bucket] / 255) * 100) : 12}%`;
      });
      if (!visualizerPaused) visualizerRef.current?.render();
      frame = requestAnimationFrame(render);
    };
    resize();
    addEventListener('resize', resize);
    frame = requestAnimationFrame(render);
    return () => {
      removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
    };
  }, [visualizerPaused, visualizerReady]);

  useEffect(() => {
    if (!visualizerReady) return;
    const timer = window.setTimeout(() => {
      visualizerRef.current!.loadPreset(
        presetsRef.current[visualization],
        presetLoadedRef.current ? 2.4 : 0,
      );
      presetLoadedRef.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, [visualization, visualizerReady]);

  useEffect(() => {
    if (
      !visualizerReady ||
      visualizerPaused ||
      !visualizationInterval ||
      visualizations.length < 2
    )
      return;
    const timer = window.setTimeout(
      () =>
        setVisualization(
          (current) =>
            visualizations[
              (visualizations.indexOf(current) + 1) % visualizations.length
            ],
        ),
      visualizationInterval * 1000,
    );
    return () => clearTimeout(timer);
  }, [visualization, visualizationInterval, visualizations, visualizerPaused, visualizerReady]);

  const startDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
    target: HTMLElement,
  ) => {
    if (event.button !== 0 || (event.target as Element).closest('button, a'))
      return;
    const bounds = target.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
      target,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const dragTarget = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;
    const target = dragRef.current.target!;
    target.style.left = `${Math.min(Math.max(0, event.clientX - dragRef.current.offsetX), Math.max(0, innerWidth - target.offsetWidth))}px`;
    target.style.top = `${Math.min(Math.max(0, event.clientY - dragRef.current.offsetY), Math.max(0, innerHeight - target.offsetHeight))}px`;
    target.style.transform = 'none';
  };

  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;
    const target = dragRef.current.target!;
    dragRef.current.pointerId = -1;
    const bounds = target.getBoundingClientRect();
    localStorage.setItem(
      target === playerRef.current
        ? 'ente-player-position'
        : 'ente-settings-position',
      `${bounds.left},${bounds.top}`,
    );
  };

  const recenterPlayer = (event: ReactMouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('button, a')) return;
    const player = playerRef.current!;
    player.style.left = '50%';
    player.style.top = '50%';
    player.style.transform = 'translate(-50%, -50%)';
    localStorage.removeItem('ente-player-position');
  };

  const minimizePlayer = async () => {
    if (minimized || minimizing) return;
    setSettingsOpen(false);
    setMinimizing(true);
    let animation: Animation | undefined;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animation = playerRef.current!.firstElementChild!.animate(
        [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(32px) scale(0.94)' }],
        { duration: 180, easing: 'ease-in', fill: 'forwards' },
      );
      await animation.finished;
    }
    flushSync(() => {
      setMinimized(true);
      setMinimizing(false);
    });
    animation?.cancel();
  };

  const toggleFullscreen = () =>
    void (document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen());

  const doubleTapVisualizer = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      event.pointerType === 'mouse' ||
      (event.target as Element).closest('.player-wrap, .settings-backdrop, .visualizer-controls')
    )
      return;
    const now = performance.now();
    if (
      lastVisualizerTapRef.current &&
      now - lastVisualizerTapRef.current < 350
    )
      toggleFullscreen();
    lastVisualizerTapRef.current = now;
  };

  const togglePlayback = async () => {
    const audio = activeAudioRef.current
      ? audioBRef.current!
      : audioARef.current!;
    if (audio.paused) {
      try {
        await connectAudio();
        await audio.play();
        setPlaying(true);
      } catch (reason) {
        console.error('Playback failed', reason);
      }
    } else {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = 0;
      audio.pause();
      setPlaying(false);
    }
  };

  const crossfadeTo = async (next: number) => {
    if (crossfadingRef.current) return;
    clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = 0;
    crossfadingRef.current = true;
    await connectAudio();
    const fromSlot = activeAudioRef.current;
    const toSlot = fromSlot ? 0 : 1;
    const audio = [audioARef.current!, audioBRef.current!];
    const from = audio[fromSlot];
    const to = audio[toSlot];
    const context = contextRef.current!;
    const fromGain = gainRefs.current[fromSlot]!;
    const toGain = gainRefs.current[toSlot]!;
    const source = sourceFor(tracks[next]);
    if (to.getAttribute('src') !== source) to.src = source;
    to.currentTime = 0;
    to.volume = volume / 100;
    try {
      await to.play();
      const now = context.currentTime;
      fromGain.gain.cancelScheduledValues(now);
      toGain.gain.cancelScheduledValues(now);
      fromGain.gain.setValueAtTime(1, now);
      toGain.gain.setValueAtTime(1, now);
      fromGain.gain.linearRampToValueAtTime(0, now + crossfadeSeconds);
      activeAudioRef.current = toSlot;
      setIndex(next);
      setElapsed(0);
      setDuration(Number.isFinite(to.duration) ? to.duration : 0);
      playingRef.current = true;
      setPlaying(true);
      window.setTimeout(() => {
        from.pause();
        from.currentTime = 0;
        const standbySource = sourceFor(
          tracks[looping ? next : (next + 1) % tracks.length],
        );
        if (from.getAttribute('src') !== standbySource) {
          from.src = standbySource;
          from.load();
        }
        crossfadingRef.current = false;
      }, crossfadeSeconds * 1000);
    } catch (reason) {
      to.pause();
      crossfadingRef.current = false;
      console.error('Track transition failed', reason);
    }
  };

  const selectTrack = (next: number) => {
    if (playingRef.current) return void crossfadeTo(next);
    const audio = activeAudioRef.current
      ? audioBRef.current!
      : audioARef.current!;
    audio.src = sourceFor(tracks[next]);
    audio.load();
    setIndex(next);
    setElapsed(0);
    setDuration(0);
  };
  const step = (direction: number) =>
    selectTrack((index + direction + tracks.length) % tracks.length);

  const seek = (next: number) => {
    seekingRef.current = true;
    clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = 0;
    const audio = activeAudioRef.current
      ? audioBRef.current!
      : audioARef.current!;
    audio.currentTime = next;
    setElapsed(next);
  };

  const updateTime = (slot: 0 | 1, audio: HTMLAudioElement) => {
    if (slot !== activeAudioRef.current || seekingRef.current) return;
    setElapsed(audio.currentTime);
    const remaining = audio.duration - audio.currentTime;
    if (
      playingRef.current &&
      !audio.paused &&
      Number.isFinite(audio.duration) &&
      remaining <= 1 &&
      !transitionTimerRef.current
    ) {
      transitionTimerRef.current = window.setTimeout(
        () => {
          transitionTimerRef.current = 0;
          if (playingRef.current)
            void crossfadeTo(looping ? index : (index + 1) % tracks.length);
        },
        Math.max(0, remaining - crossfadeSeconds) * 1000,
      );
    }
  };

  const toggleLoop = () =>
    setLooping((current) => {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = 0;
      return !current;
    });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target =
        event.target instanceof HTMLElement ? event.target : undefined;
      if (event.code === 'Escape' && settingsOpen) {
        setSettingsOpen(false);
        return;
      }
      if (event.code === 'Space') {
        if (
          target?.closest(
            'input, textarea, [contenteditable], [role="combobox"], [role="listbox"], [role="slider"]',
          )
        )
          return;
        event.preventDefault();
        if (!event.repeat) void togglePlayback();
        return;
      }
      if (
        target?.closest(
          'button, input, textarea, [role="slider"], [role="combobox"]',
        )
      )
        return;
      if (event.code === 'ArrowRight') step(1);
      else if (event.code === 'ArrowLeft') step(-1);
    };
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  });

  const metadataLoaded = (slot: 0 | 1, audio: HTMLAudioElement) => {
    audio.volume = volume / 100;
    if (activeAudioRef.current !== slot) return;
    setDuration(audio.duration);
    if (!restoreTimeRef.current) return;
    const time = Math.min(
      restoreTimeRef.current,
      Math.max(0, audio.duration - 0.1),
    );
    restoreTimeRef.current = 0;
    audio.currentTime = time;
    setElapsed(time);
  };

  return (
    <main
      className={`music-shell skin-${skin}`}
      onPointerUp={doubleTapVisualizer}
      onClick={(event) => {
        if (!(event.target as Element).closest('.player-wrap, .settings-backdrop, .visualizer-controls'))
          void minimizePlayer();
      }}
      onDoubleClick={(event) => {
        if (
          !(
            lastVisualizerTapRef.current &&
            performance.now() - lastVisualizerTapRef.current < 500
          ) &&
          !(event.target as Element).closest(
            '.player-wrap, .settings-backdrop, .visualizer-controls',
          )
        )
          toggleFullscreen();
      }}
    >
      <canvas ref={canvasRef} className="visualizer" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="visualizer-controls">
        <span title={visualization}>{visualization}</span>
        <button
          type="button"
          aria-label={visualizerPaused ? 'Resume visualization' : 'Pause visualization'}
          aria-pressed={visualizerPaused}
          title={visualizerPaused ? 'Resume visualization' : 'Pause visualization'}
          disabled={!visualizerReady}
          onClick={() => setVisualizerPaused((paused) => !paused)}
        >
          <Icon name={visualizerPaused ? 'play' : 'pause'} />
        </button>
        <button
          type="button"
          aria-label="Next visualization"
          title="Next visualization"
          disabled={!visualizerReady || visualizations.length < 2}
          onClick={() => setVisualization((current) =>
            visualizations[(visualizations.indexOf(current) + 1) % visualizations.length],
          )}
        >
          <Icon name="next" />
        </button>
      </div>

      <section
        ref={playerRef}
        className={`player-wrap ${minimized ? 'is-minimized' : ''}`}
        aria-label="Music player"
      >
        <div className={`player-window ${minimized ? 'is-minimized' : ''}`}>
          <div
            className="title-bar"
            onPointerDown={(event) => startDrag(event, playerRef.current!)}
            onPointerMove={dragTarget}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            onDoubleClick={recenterPlayer}
            title="Drag to move · Double-click to center"
          >
            <img className="title-logo" src="/ente-music.svg" alt="Ente Music" draggable={false} />
            {skin !== 'classic' && <span className="hardware-label">STEREO MUSIC PLAYER</span>}
            <span className="window-actions">
              <button
                type="button"
                className="window-button"
                aria-label="Settings"
                aria-expanded={settingsOpen}
                aria-controls="player-settings"
                onClick={() => setSettingsOpen((value) => !value)}
              >
                <Icon name="settings" />
              </button>
              <button
                type="button"
                className="window-button"
                aria-label={minimized ? 'Restore player' : 'Minimize player'}
                onClick={() => void minimizePlayer()}
              >
                <Icon name={minimized ? 'restore' : 'minimize'} />
              </button>
            </span>
          </div>

          <div className="mini-player">
            <div className="mini-track">
              <strong>{track.title}</strong>
              <span className="mini-separator" aria-hidden="true">
                ·
              </span>
              <span>{track.artist}</span>
            </div>
            <div className="mini-seek">
              <span>{formatTime(elapsed)}</span>
              <input
                className="slider"
                type="range"
                aria-label="Track position"
                min={0}
                max={Math.max(duration, 1)}
                step={0.1}
                value={elapsed}
                style={sliderStyle(elapsed, Math.max(duration, 1))}
                onChange={(event) => seek(Number(event.currentTarget.value))}
                onPointerUp={() => (seekingRef.current = false)}
                onKeyUp={() => (seekingRef.current = false)}
                onBlur={() => (seekingRef.current = false)}
              />
            </div>
            <button
              type="button"
              className="machine-button"
              aria-label="Previous track"
              onClick={() => step(-1)}
            >
              <Icon name="previous" />
            </button>
            <button
              type="button"
              className="machine-button play-button"
              aria-label={playing ? 'Pause' : 'Play'}
              aria-keyshortcuts="Space"
              onClick={() => void togglePlayback()}
            >
              <Icon name={playing ? 'pause' : 'play'} />
            </button>
            <button
              type="button"
              className="machine-button"
              aria-label="Next track"
              onClick={() => step(1)}
            >
              <Icon name="next" />
            </button>
            <button
              type="button"
              className={`machine-button loop-button ${looping ? 'is-active' : ''}`}
              aria-label={
                looping ? 'Turn off track loop' : 'Loop current track'
              }
              aria-pressed={looping}
              title={looping ? 'Looping current track' : 'Loop current track'}
              onClick={toggleLoop}
            >
              <Icon name="loop" />
            </button>
            <button
              type="button"
              className="machine-button"
              aria-label="Restore player"
              title="Restore player"
              onClick={() => setMinimized(false)}
            >
              <Icon name="restore" />
            </button>
          </div>

          <div className="player-body">
            <div className="display">
              <div className="track-number">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="display-copy">
                <p className="track-title">{track.title}</p>
                <p className="track-artist">{track.artist}</p>
              </div>
              <div className="clock">
                {skin !== 'classic' ? <SegmentClock seconds={elapsed} /> : formatTime(elapsed)}
              </div>
              <div ref={meterRef} className="meter" aria-hidden="true">
                {Array.from({ length: 18 }, (_, bar) => (
                  <i
                    key={bar}
                    style={{ height: `${28 + ((bar * 17) % 68)}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="seek-row">
              <input
                className="slider"
                type="range"
                aria-label="Track position"
                min={0}
                max={Math.max(duration, 1)}
                step={0.1}
                value={elapsed}
                style={sliderStyle(elapsed, Math.max(duration, 1))}
                onChange={(event) => seek(Number(event.currentTarget.value))}
                onPointerUp={() => (seekingRef.current = false)}
                onKeyUp={() => (seekingRef.current = false)}
                onBlur={() => (seekingRef.current = false)}
              />
            </div>

            <div className="transport-row">
              <div className="transport-controls">
                <button
                  type="button"
                  className="machine-button"
                  aria-label="Previous track"
                  onClick={() => step(-1)}
                >
                  <Icon name="previous" />
                </button>
                <button
                  type="button"
                  className="machine-button play-button"
                  aria-label={playing ? 'Pause' : 'Play'}
                  aria-keyshortcuts="Space"
                  onClick={() => void togglePlayback()}
                >
                  <Icon name={playing ? 'pause' : 'play'} />
                </button>
                <button
                  type="button"
                  className="machine-button"
                  aria-label="Next track"
                  onClick={() => step(1)}
                >
                  <Icon name="next" />
                </button>
              </div>

              <div className="volume-control">
                <span className="volume-icon" aria-hidden="true">
                  VOL
                </span>
                <input
                  className="slider"
                  type="range"
                  aria-label="Volume"
                  min={0}
                  max={100}
                  value={volume}
                  style={sliderStyle(volume, 100)}
                  onChange={(event) => {
                    const next = Number(event.currentTarget.value);
                    setVolume(next);
                    audioARef.current!.volume = next / 100;
                    audioBRef.current!.volume = next / 100;
                  }}
                />
              </div>

              <button
                type="button"
                className={`machine-button loop-button ${looping ? 'is-active' : ''}`}
                aria-label={
                  looping ? 'Turn off track loop' : 'Loop current track'
                }
                aria-pressed={looping}
                title={looping ? 'Looping current track' : 'Loop current track'}
                onClick={toggleLoop}
              >
                <Icon name="loop" />
              </button>
            </div>

            <div className="embedded-playlist">
              <div className="playlist-label">
                <span>PLAYLIST</span>
                <span>{tracks.length} TRACKS</span>
              </div>
              <ol>
                {tracks.map((item, itemIndex) => (
                  <li key={item.id}>
                    <button
                      className={itemIndex === index ? 'active' : ''}
                      onClick={() => selectTrack(itemIndex)}
                    >
                      <span>{String(itemIndex + 1).padStart(2, '0')}</span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.artist}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <div className="visualizer-controls submission-controls">
        <SubmissionButton />
      </div>

      {settingsOpen && (
        <div
          className="settings-backdrop"
          onClick={() => setSettingsOpen(false)}
        >
          <section
            ref={settingsRef}
            id="player-settings"
            className="settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="settings-titlebar"
              title="Drag to move"
              onPointerDown={(event) => startDrag(event, settingsRef.current!)}
              onPointerMove={dragTarget}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
            >
              <span id="settings-title">Settings</span>
              <button
                type="button"
                className="window-button"
                aria-label="Close settings"
                autoFocus
                onClick={() => setSettingsOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="settings-content">
              <section
                className="settings-section"
                aria-labelledby="skin-setting"
              >
                <div className="settings-section-heading">
                  <span>
                    <strong id="skin-setting">Skin</strong>
                    <small>Change the appearance of the player.</small>
                  </span>
                </div>
                <label className="setting-label" htmlFor="skin-select">
                  Skin
                </label>
                <select
                  id="skin-select"
                  className="preset-select"
                  value={skin}
                  onChange={(event) => setSkin(event.currentTarget.value as Skin)}
                >
                  {skins.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </section>

              <section
                className="settings-section"
                aria-labelledby="visualizer-setting"
              >
                <div className="settings-section-heading">
                  <span>
                    <strong id="visualizer-setting">Visualizer</strong>
                    <small>Choose a MilkDrop preset for the background.</small>
                  </span>
                </div>
                <div className="visualizer-fields">
                  <div>
                    <label className="setting-label" htmlFor="preset-setting">
                      Preset · {visualizations.length} available
                    </label>
                    <select
                      id="preset-setting"
                      className="preset-select"
                      value={visualization}
                      onChange={(event) =>
                        setVisualization(event.currentTarget.value)
                      }
                    >
                      {visualizations.map((preset) => (
                        <option key={preset} value={preset}>
                          {preset}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="setting-label"
                      htmlFor="interval-setting"
                    >
                      Auto-change interval
                    </label>
                    <select
                      id="interval-setting"
                      className="preset-select"
                      value={visualizationInterval}
                      onChange={(event) => {
                        const interval = Number(
                          event.currentTarget.value,
                        ) as VisualizationInterval;
                        setVisualizationInterval(interval);
                      }}
                    >
                      {visualizationIntervals.map(([seconds, label]) => (
                        <option key={seconds} value={seconds}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      )}

      <audio
        ref={audioARef}
        preload="metadata"
        onTimeUpdate={(event) => updateTime(0, event.currentTarget)}
        onLoadedMetadata={(event) => metadataLoaded(0, event.currentTarget)}
        onPlay={() => {
          if (activeAudioRef.current !== 0) return;
          playingRef.current = true;
          setPlaying(true);
        }}
        onPause={() => {
          if (activeAudioRef.current !== 0) return;
          playingRef.current = false;
          setPlaying(false);
        }}
        onEnded={() => {
          if (activeAudioRef.current === 0)
            void crossfadeTo(looping ? index : (index + 1) % tracks.length);
        }}
      />
      <audio
        ref={audioBRef}
        preload="metadata"
        onTimeUpdate={(event) => updateTime(1, event.currentTarget)}
        onLoadedMetadata={(event) => metadataLoaded(1, event.currentTarget)}
        onPlay={() => {
          if (activeAudioRef.current !== 1) return;
          playingRef.current = true;
          setPlaying(true);
        }}
        onPause={() => {
          if (activeAudioRef.current !== 1) return;
          playingRef.current = false;
          setPlaying(false);
        }}
        onEnded={() => {
          if (activeAudioRef.current === 1)
            void crossfadeTo(looping ? index : (index + 1) % tracks.length);
        }}
      />
    </main>
  );
}
