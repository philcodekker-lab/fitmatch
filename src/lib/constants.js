// Shared option lists for goals, training styles, experience levels and
// specialisms. Used by the quiz form, PT profile editor and the matching
// algorithm. Keep these IDs stable — they are persisted in the database.

export const GOALS = [
  { id: 'fat_loss', label: 'Fat loss' },
  { id: 'muscle_gain', label: 'Muscle gain' },
  { id: 'strength', label: 'Strength & powerlifting' },
  { id: 'general_fitness', label: 'General fitness' },
  { id: 'endurance', label: 'Endurance / running' },
  { id: 'mobility', label: 'Mobility & rehab' },
  { id: 'sport_specific', label: 'Sport-specific' },
];

export const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export const TRAINING_STYLES = [
  { id: 'online', label: 'Online' },
  { id: 'in_person', label: 'In-person' },
  { id: 'hybrid', label: 'Hybrid (mix of both)' },
];

export const BUDGET_RANGES = [
  { id: 'under_30', label: 'Under £30 / session', min: 0, max: 30 },
  { id: '30_60', label: '£30 – £60 / session', min: 30, max: 60 },
  { id: '60_100', label: '£60 – £100 / session', min: 60, max: 100 },
  { id: '100_plus', label: '£100+ / session', min: 100, max: 9999 },
];

export const SPECIALISM_OPTIONS = GOALS.map((g) => g.id).concat([
  'pre_post_natal',
  'nutrition_coaching',
  'injury_rehab',
  'olympic_lifting',
]);

export const SPECIALISM_LABELS = Object.fromEntries(
  GOALS.map((g) => [g.id, g.label]).concat([
    ['pre_post_natal', 'Pre / post-natal'],
    ['nutrition_coaching', 'Nutrition coaching'],
    ['injury_rehab', 'Injury rehab'],
    ['olympic_lifting', 'Olympic lifting'],
  ]),
);

export const ROLES = { PT: 'PT', ADMIN: 'ADMIN' };
