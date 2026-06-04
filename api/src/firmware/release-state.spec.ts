import { canTransition } from './release-state';

describe('release state machine', () => {
  describe('legal transitions', () => {
    it('allows DRAFT -> TESTING', () => {
      expect(canTransition('DRAFT', 'TESTING')).toBe(true);
    });
    it('allows TESTING -> RELEASED', () => {
      expect(canTransition('TESTING', 'RELEASED')).toBe(true);
    });
    it('allows TESTING -> DRAFT', () => {
      expect(canTransition('TESTING', 'DRAFT')).toBe(true);
    });
    it('allows RELEASED -> DEPRECATED', () => {
      expect(canTransition('RELEASED', 'DEPRECATED')).toBe(true);
    });
  });

  describe('illegal transitions', () => {
    it('forbids DRAFT -> RELEASED', () => {
      expect(canTransition('DRAFT', 'RELEASED')).toBe(false);
    });
    it('forbids DRAFT -> DEPRECATED', () => {
      expect(canTransition('DRAFT', 'DEPRECATED')).toBe(false);
    });
    it('forbids TESTING -> DEPRECATED', () => {
      expect(canTransition('TESTING', 'DEPRECATED')).toBe(false);
    });
    it('forbids RELEASED -> DRAFT', () => {
      expect(canTransition('RELEASED', 'DRAFT')).toBe(false);
    });
    it('forbids RELEASED -> TESTING', () => {
      expect(canTransition('RELEASED', 'TESTING')).toBe(false);
    });
    it('forbids DEPRECATED -> anything', () => {
      expect(canTransition('DEPRECATED', 'DRAFT')).toBe(false);
      expect(canTransition('DEPRECATED', 'TESTING')).toBe(false);
      expect(canTransition('DEPRECATED', 'RELEASED')).toBe(false);
    });
  });
});
