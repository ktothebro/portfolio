import type { CrossEffectId } from './types';

export type CrossEffect = {
  readonly id: CrossEffectId;
  readonly title: string;
  readonly summary: string;
};

export const crossEffects: Record<CrossEffectId, CrossEffect> = {
  'client-response': {
    id: 'client-response',
    title: 'Client response',
    summary:
      'The sequence moves to Finished. Every step that is not already terminal moves to Cancelled. That step outcome is not drawn as extra arrows on the step diagram.',
  },
  'sequence-cancellation': {
    id: 'sequence-cancellation',
    title: 'Sequence cancellation',
    summary:
      'The sequence moves to Cancelled. Every unfinished step moves to Cancelled. Steps already in Completed, Skipped, Failed, or Cancelled stay there. Pending has no local cancel arrow and is still settled by this effect.',
  },
};

export const retryNote =
  'Automated work may be retried without leaving In progress. There is no Retry state and no transition back to In progress. The step moves to Failed only after its retry allowance is exhausted. The allowance is not given a number in this model.';
