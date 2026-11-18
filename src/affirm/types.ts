export type LifecycleId = 'sequence' | 'step';

export type Tone =
  | 'idle'
  | 'active'
  | 'waiting'
  | 'success'
  | 'failure'
  | 'halt'
  | 'skip';

export type Emphasis = 'default' | 'selected' | 'related' | 'quiet';

export type CrossEffectId = 'client-response' | 'sequence-cancellation';

export type Point = { readonly x: number; readonly y: number };

export type EdgeRoute =
  | { readonly kind: 'smooth' }
  | { readonly kind: 'polyline'; readonly bends: readonly Point[] };

export type StateDefinition = {
  readonly id: string;
  readonly label: string;
  readonly terminal: boolean;
  readonly tone: Tone;
  readonly purpose: string;
  readonly entry: string;
  readonly considerations: string;
  readonly terminalBehavior: string | null;
  readonly effects: readonly CrossEffectId[];
  readonly position: Point;
};

export type TransitionDefinition = {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly sourceHandle: string;
  readonly targetHandle: string;
  readonly trigger: string;
  readonly conditions: string;
  readonly result: string;
  readonly considerations: string;
  readonly effects: readonly CrossEffectId[];
  readonly route: EdgeRoute;
};

export type LifecycleMachine = {
  readonly id: LifecycleId;
  readonly title: string;
  readonly kicker: string;
  readonly summary: string;
  readonly states: readonly StateDefinition[];
  readonly transitions: readonly TransitionDefinition[];
};

export type Selection =
  | { readonly kind: 'node'; readonly lifecycle: LifecycleId; readonly id: string }
  | { readonly kind: 'edge'; readonly lifecycle: LifecycleId; readonly id: string };

export const NODE_W = 136;
export const NODE_H = 68;
export const COL1 = 184;
