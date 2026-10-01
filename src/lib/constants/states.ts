export const ACTIVE_STATES = ['NC', 'MD', 'CT', 'ND', 'KS'] as const;

export type ActiveState = typeof ACTIVE_STATES[number];

export const STATE_NAMES: Record<ActiveState, string> = {
  NC: 'North Carolina',
  MD: 'Maryland',
  CT: 'Connecticut',
  ND: 'North Dakota',
  KS: 'Kansas',
};

export function isStateActive(stateCode: string): boolean {
  return ACTIVE_STATES.includes(stateCode as ActiveState);
}
