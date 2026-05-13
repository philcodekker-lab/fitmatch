/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TRAINERS = [
  {
    email: 'aisha@fitmatch.dev',
    name: 'Aisha Khan',
    bio: 'Strength & conditioning coach with 8 years of experience helping clients drop body fat without losing muscle.',
    caseStudies:
      'Helped a 38yo father of two lose 14kg in 6 months while increasing his squat by 40kg. Worked with a postpartum runner returning to her marathon PB.',
    currentOffer: 'Free 30-min consultation + a 4-week starter plan for £99.',
    specialisms: ['fat_loss', 'strength', 'general_fitness'],
    trainingStyles: ['in_person', 'hybrid'],
    experienceLevels: ['beginner', 'intermediate'],
    priceMin: 45,
    priceMax: 70,
    location: 'London',
    approved: true,
    featured: true,
  },
  {
    email: 'marcus@fitmatch.dev',
    name: 'Marcus Bell',
    bio: 'Former competitive powerlifter. I coach intermediate and advanced lifters looking to build serious strength.',
    caseStudies:
      'Coached a national-level junior lifter to a 600kg total. Took a 50yo client from 0 pull-ups to 8 strict reps in a year.',
    currentOffer: 'Block of 8 sessions at 10% off for new clients.',
    specialisms: ['strength', 'muscle_gain', 'olympic_lifting'],
    trainingStyles: ['in_person'],
    experienceLevels: ['intermediate', 'advanced'],
    priceMin: 70,
    priceMax: 120,
    location: 'Manchester',
    approved: true,
    featured: false,
  },
  {
    email: 'lena@fitmatch.dev',
    name: 'Lena Park',
    bio: 'Online coach specialising in body recomposition and habit-based nutrition. Realistic, sustainable plans.',
    caseStudies:
      'Worked with 60+ remote clients on 12-week recomp programmes. Average loss: 6.4kg fat, +1.8kg lean mass.',
    currentOffer: '12-week online programme £540 (paid in 3 monthly instalments).',
    specialisms: ['fat_loss', 'muscle_gain', 'nutrition_coaching'],
    trainingStyles: ['online'],
    experienceLevels: ['beginner', 'intermediate'],
    priceMin: 30,
    priceMax: 55,
    location: 'Remote (UK)',
    approved: true,
    featured: true,
  },
  {
    email: 'tom@fitmatch.dev',
    name: 'Tom Walters',
    bio: 'Endurance coach and former GB age-group triathlete. I help runners and cyclists train smarter, not just harder.',
    caseStudies:
      'Got an absolute beginner to a sub-2hr half marathon in 9 months. Coached a 45yo cyclist through her first 100-mile event.',
    currentOffer: 'Free Garmin/Strava analysis on the first call.',
    specialisms: ['endurance', 'general_fitness'],
    trainingStyles: ['online', 'hybrid'],
    experienceLevels: ['beginner', 'intermediate', 'advanced'],
    priceMin: 40,
    priceMax: 75,
    location: 'Bristol',
    approved: true,
    featured: false,
  },
  {
    email: 'priya@fitmatch.dev',
    name: 'Priya Shah',
    bio: 'Pre and post-natal specialist. Safe, evidence-based programmes that actually fit around new parenthood.',
    caseStudies:
      'Supported 40+ mums through pregnancy and 4th-trimester recovery. Specialist diastasis recti & pelvic-floor work.',
    currentOffer: 'Bring a friend and you both get 20% off your first month.',
    specialisms: ['pre_post_natal', 'general_fitness', 'mobility'],
    trainingStyles: ['in_person', 'hybrid'],
    experienceLevels: ['beginner'],
    priceMin: 40,
    priceMax: 65,
    location: 'London',
    approved: true,
    featured: false,
  },
  {
    email: 'jordan@fitmatch.dev',
    name: 'Jordan Reeves',
    bio: 'Hypertrophy nerd. I write personalised lifting programmes for people who want to actually look like they lift.',
    caseStudies:
      'Took a 22yo from 68kg to a lean 80kg over 18 months. Coaches several physique competitors.',
    currentOffer: 'Free programme review for new sign-ups.',
    specialisms: ['muscle_gain', 'strength'],
    trainingStyles: ['online'],
    experienceLevels: ['intermediate', 'advanced'],
    priceMin: 35,
    priceMax: 60,
    location: 'Remote (UK)',
    approved: true,
    featured: false,
  },
  {
    email: 'sara@fitmatch.dev',
    name: 'Sara Donnelly',
    bio: 'Friendly, beginner-focused PT. If the gym makes you anxious, we will fix that together.',
    caseStudies:
      'Specialises in absolute beginners — 80% of her clients had never set foot in a gym before working together.',
    currentOffer: '5 sessions for the price of 4 for first-timers.',
    specialisms: ['general_fitness', 'fat_loss', 'mobility'],
    trainingStyles: ['in_person'],
    experienceLevels: ['beginner'],
    priceMin: 30,
    priceMax: 45,
    location: 'Leeds',
    approved: true,
    featured: false,
  },
  {
    email: 'david@fitmatch.dev',
    name: 'David Okafor',
    bio: 'High-performance coach for combat athletes and sport-specific S&C. Bring a goal — bring a deadline.',
    caseStudies:
      'Prepped multiple amateur boxers for title fights. Works with a Premiership academy footballer on off-season speed.',
    currentOffer: 'Performance audit + 4-week programme for £199.',
    specialisms: ['sport_specific', 'strength', 'endurance'],
    trainingStyles: ['in_person', 'hybrid'],
    experienceLevels: ['intermediate', 'advanced'],
    priceMin: 80,
    priceMax: 140,
    location: 'London',
    approved: true,
    featured: true,
  },
  {
    email: 'megan@fitmatch.dev',
    name: 'Megan Ross',
    bio: 'Mobility-first coach. I help desk workers and over-40s feel 10 years younger in 12 weeks.',
    caseStudies:
      'Resolved chronic lower-back pain for a 52yo software engineer. Got a 60yo client back to skiing pain-free.',
    currentOffer: 'Free posture assessment on first session.',
    specialisms: ['mobility', 'injury_rehab', 'general_fitness'],
    trainingStyles: ['online', 'in_person'],
    experienceLevels: ['beginner', 'intermediate'],
    priceMin: 50,
    priceMax: 80,
    location: 'Edinburgh',
    approved: true,
    featured: false,
  },
  {
    email: 'rashid@fitmatch.dev',
    name: 'Rashid Patel',
    bio: 'Online nutrition + training coach. Calm, data-driven, and very patient.',
    caseStudies:
      '90+ remote clients in the last 2 years; average client retention is 11 months.',
    currentOffer: 'First month free if you commit to a 6-month plan.',
    specialisms: ['fat_loss', 'nutrition_coaching', 'general_fitness'],
    trainingStyles: ['online'],
    experienceLevels: ['beginner', 'intermediate'],
    priceMin: 25,
    priceMax: 45,
    location: 'Remote (UK)',
    approved: true,
    featured: false,
  },
  {
    email: 'chloe@fitmatch.dev',
    name: 'Chloe Bennett',
    bio: 'CrossFit L2 coach turned PT. I love coaching technique-heavy lifts with people new to barbell work.',
    caseStudies:
      'Took 12 complete beginners through a 6-month barbell foundations programme.',
    currentOffer: 'Free technique session on snatch / clean & jerk.',
    specialisms: ['olympic_lifting', 'strength', 'muscle_gain'],
    trainingStyles: ['in_person'],
    experienceLevels: ['beginner', 'intermediate'],
    priceMin: 45,
    priceMax: 65,
    location: 'Birmingham',
    approved: true,
    featured: false,
  },
  {
    email: 'oliver@fitmatch.dev',
    name: 'Oliver Grant',
    bio: 'Rehab specialist working alongside physios. Returns clients to full training after injury.',
    caseStudies:
      'Coached post-ACL clients back to recreational sport. Works with two NHS physios on referrals.',
    currentOffer: 'Free intro call with your physio on the line.',
    specialisms: ['injury_rehab', 'mobility', 'general_fitness'],
    trainingStyles: ['in_person', 'hybrid'],
    experienceLevels: ['beginner', 'intermediate'],
    priceMin: 60,
    priceMax: 100,
    location: 'Brighton',
    approved: true,
    featured: false,
  },
  {
    email: 'pending-pt@fitmatch.dev',
    name: 'Sam Pending (awaiting approval)',
    bio: 'New trainer, recently signed up. Profile is still being reviewed by the FindMyPT team.',
    caseStudies: '',
    currentOffer: '',
    specialisms: ['general_fitness'],
    trainingStyles: ['online'],
    experienceLevels: ['beginner'],
    priceMin: 25,
    priceMax: 40,
    location: 'Cardiff',
    approved: false,
    featured: false,
  },
];

async function main() {
  console.log('Seeding database…');

  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@fitmatch.dev' },
    update: { passwordHash: adminPasswordHash, role: 'ADMIN' },
    create: {
      email: 'admin@fitmatch.dev',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('  ✓ Admin: admin@fitmatch.dev / admin123');

  const ptPasswordHash = bcrypt.hashSync('password123', 10);
  for (const t of TRAINERS) {
    await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        passwordHash: ptPasswordHash,
        role: 'PT',
        trainerProfile: {
          create: {
            name: t.name,
            bio: t.bio,
            caseStudies: t.caseStudies,
            currentOffer: t.currentOffer,
            specialisms: JSON.stringify(t.specialisms),
            trainingStyles: JSON.stringify(t.trainingStyles),
            experienceLevels: JSON.stringify(t.experienceLevels),
            priceMin: t.priceMin,
            priceMax: t.priceMax,
            location: t.location,
            approved: t.approved,
            featured: t.featured,
          },
        },
      },
    });
  }
  console.log(`  ✓ ${TRAINERS.length} trainers (password for all: password123)`);

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
