// Helpers for reading/writing the JSON-encoded fields on TrainerProfile.
//
// SQLite has no native array/JSON type, so we keep things portable by storing
// arrays and objects as JSON strings and decoding on the way out.

function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

const ARRAY_FIELDS = [
  'specialisms',
  'trainingStyles',
  'experienceLevels',
  'caseStudyMedia',
  'credentials',
  'weeklySchedule',
  'languages',
  'gymLocations',
];

const OBJECT_FIELDS = ['pricingTiers'];

export function decodeProfile(profile) {
  if (!profile) return null;
  const out = { ...profile };
  for (const f of ARRAY_FIELDS) {
    out[f] = parseJson(profile[f], []);
  }
  for (const f of OBJECT_FIELDS) {
    out[f] = parseJson(profile[f], {});
  }
  return out;
}

export function encodeListFields(input) {
  const out = { ...input };
  for (const f of ARRAY_FIELDS) {
    if (Array.isArray(input[f])) out[f] = JSON.stringify(input[f]);
  }
  for (const f of OBJECT_FIELDS) {
    const v = input[f];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[f] = JSON.stringify(v);
    }
  }
  return out;
}
