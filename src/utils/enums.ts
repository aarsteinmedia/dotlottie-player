export enum ObjectFit {
  Contain = 'contain',
  Cover = 'cover',
  Fill = 'fill',
  None = 'none',
  ScaleDown = 'scale-down',
}

export enum PlayerState {
  Completed = 'completed',
  Destroyed = 'destroyed',
  Error = 'error',
  Frozen = 'frozen',
  Loading = 'loading',
  Paused = 'paused',
  Playing = 'playing',
  Stopped = 'stopped',
}

export enum PlayMode {
  Bounce = 'bounce',
  Normal = 'normal',
}

export enum PlayerEvents {
  Complete = 'complete',
  Destroyed = 'destroyed',
  Error = 'error',
  Frame = 'frame',
  Freeze = 'freeze',
  Load = 'load',
  Loop = 'loop',
  Next = 'next',
  Pause = 'pause',
  Play = 'play',
  Previous = 'previous',
  Ready = 'ready',
  Rendered = 'rendered',
  Stop = 'stop',
}

export enum PreserveAspectRatio {
  Contain = 'xMidYMid meet',
  Cover = 'xMidYMid slice',
  Initial = 'none',
  None = 'xMinYMin slice',
}

export enum RendererType {
  Canvas = 'canvas',
  HTML = 'html',
  SVG = 'svg',
}
