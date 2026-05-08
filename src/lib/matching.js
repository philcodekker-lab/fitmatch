// Simple weighted scoring algorithm. Higher score == better match.
//
// Inputs (from quiz):
//   goal:           one of GOALS ids
//   experience:     one of EXPERIENCE_LEVELS ids
//   trainingStyle:  one of TRAINING_STYLES ids
//   budget:         { min, max } in GBP / session
//   location:       optional free-text city
//
// We accept a list of decoded TrainerProfile objects (specialisms etc. as arrays).

import { BUDGET_RANGES } from './constants';

const WEIGHTS = {
  goal: 40,           // primary specialism match
  trainingStyle: 20,  // online / in_person / hybrid
  experience: 15,     // PT explicitly works with this level
  budget: 15,         // PT's price range overlaps budget
  location: 10,       // location string match (case-insensitive substring)
  featured: 5,        // tiny boost for monetisation
};

export function scoreTrainer(profile, quiz) {
  let score = 0;
  const reasons = [];

  // Goal -> specialism
  if (profile.specialisms.includes(quiz.goal)) {
    score += WEIGHTS.goal;
    reasons.push('Specialises in your goal');
  } else if (profile.specialisms.includes('general_fitness')) {
    // Soft fallback: a general fitness coach is still a partial match
    score += Math.round(WEIGHTS.goal * 0.4);
    reasons.push('Covers general fitness');
  }

  // Training style — hybrid PTs match anything
  const styles = profile.trainingStyles;
  if (
    styles.includes(quiz.trainingStyle) ||
    styles.includes('hybrid') ||
    quiz.trainingStyle === 'hybrid'
  ) {
    score += WEIGHTS.trainingStyle;
    reasons.push(
      quiz.trainingStyle === 'hybrid'
        ? 'Flexible on online vs in-person'
        : `Offers ${quiz.trainingStyle.replace('_', '-')} training`,
    );
  }

  // Experience level
  if (profile.experienceLevels.includes(quiz.experience)) {
    score += WEIGHTS.experience;
    reasons.push(`Experienced with ${quiz.experience} clients`);
  }

  // Budget overlap
  const budget = budgetFromId(quiz.budget);
  if (budget) {
    const overlaps =
      profile.priceMin <= budget.max && profile.priceMax >= budget.min;
    if (overlaps) {
      score += WEIGHTS.budget;
      reasons.push('Within your budget');
    }
  }

  // Location
  if (
    quiz.location &&
    quiz.location.trim() &&
    profile.location &&
    profile.location.toLowerCase().includes(quiz.location.trim().toLowerCase())
  ) {
    score += WEIGHTS.location;
    reasons.push(`Based in ${profile.location}`);
  } else if (profile.location && profile.location.toLowerCase().includes('remote')) {
    // Remote PTs are a partial location match for any user
    score += Math.round(WEIGHTS.location * 0.5);
  }

  // Featured boost
  if (profile.featured) {
    score += WEIGHTS.featured;
  }

  return { score, reasons };
}

function budgetFromId(id) {
  return BUDGET_RANGES.find((b) => b.id === id) || null;
}

export function rankTrainers(profiles, quiz, limit = 3) {
  const scored = profiles
    .map((p) => ({ ...p, ...scoreTrainer(p, quiz) }))
    // Featured trainers are surfaced first when scores tie
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return 0;
    });

  return scored.slice(0, limit);
}
