// Helpers for reading/writing the JSON-encoded array fields on TrainerProfile.

function parseList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function decodeProfile(profile) {
  if (!profile) return null;
  return {
    ...profile,
    specialisms: parseList(profile.specialisms),
    trainingStyles: parseList(profile.trainingStyles),
    experienceLevels: parseList(profile.experienceLevels),
  };
}

export function encodeListFields(input) {
  const out = { ...input };
  if (Array.isArray(input.specialisms)) out.specialisms = JSON.stringify(input.specialisms);
  if (Array.isArray(input.trainingStyles)) out.trainingStyles = JSON.stringify(input.trainingStyles);
  if (Array.isArray(input.experienceLevels))
    out.experienceLevels = JSON.stringify(input.experienceLevels);
  return out;
}
