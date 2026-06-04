import { ReleaseState } from '@prisma/client';

export const ALLOWED_TRANSITIONS: Record<ReleaseState, ReleaseState[]> = {
  DRAFT:      ['TESTING'],
  TESTING:    ['RELEASED', 'DRAFT'],
  RELEASED:   ['DEPRECATED'],
  DEPRECATED: [],
};

export function canTransition(from: ReleaseState, to: ReleaseState): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
