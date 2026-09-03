declare module 'butterchurn' {
  export type Visualizer = {
    connectAudio(source: AudioNode): void;
    loadPreset(preset: unknown, blendTime?: number): void;
    render(): void;
    setRendererSize(
      width: number,
      height: number,
      options?: { pixelRatio?: number },
    ): void;
  };

  const butterchurn: {
    createVisualizer(
      context: AudioContext,
      canvas: HTMLCanvasElement,
      options: { width: number; height: number; pixelRatio?: number },
    ): Visualizer;
  };

  export default butterchurn;
}

declare module 'butterchurn-presets' {
  const presets: { getPresets(): Record<string, unknown> };
  export default presets;
}

declare module 'butterchurn-presets/lib/*.js' {
  const presets: { getPresets(): Record<string, unknown> };
  export default presets;
}
