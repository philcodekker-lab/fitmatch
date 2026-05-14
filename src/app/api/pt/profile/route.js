import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { encodeListFields, decodeProfile } from '@/lib/profile';

export const dynamic = 'force-dynamic';

const optionalUrlOrEmpty = z
  .string()
  .max(2000)
  .refine((v) => v === '' || /^https?:\/\//.test(v), {
    message: 'Must be a URL or empty.',
  });

const pricingTiersSchema = z
  .object({
    single: z.coerce.number().int().min(0).max(2000).default(0),
    sixPack: z.coerce.number().int().min(0).max(20000).default(0),
    twelvePack: z.coerce.number().int().min(0).max(40000).default(0),
    monthlyOnline: z.coerce.number().int().min(0).max(5000).default(0),
  })
  .default({});

const weeklyDaySchema = z.object({
  label: z.string().max(10),
  intensity: z.enum(['high', 'mid', 'low', 'rest']),
});

const schema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(2000).default(''),
  caseStudies: z.string().max(4000).default(''),
  currentOffer: z.string().max(500).default(''),
  specialisms: z.array(z.string()).default([]),
  trainingStyles: z.array(z.string()).default([]),
  experienceLevels: z.array(z.string()).default([]),
  priceMin: z.coerce.number().int().min(0).max(1000).default(0),
  priceMax: z.coerce.number().int().min(0).max(1000).default(0),
  location: z.string().max(120).default(''),

  // Media + socials
  photoUrl: optionalUrlOrEmpty.optional().default(''),
  socialInstagram: z.string().max(80).default(''),
  socialTiktok: z.string().max(80).default(''),
  socialFacebook: z.string().max(200).default(''),
  socialWebsite: z.string().max(200).default(''),
  caseStudyMedia: z
    .array(z.string().url())
    .max(10, { message: 'Maximum 10 case-study photos.' })
    .default([]),

  // Practice details (Phase 2)
  responseTimeHours: z.coerce.number().int().min(1).max(168).default(24),
  acceptingClients: z.boolean().default(true),
  credentials: z.array(z.string().max(200)).max(10).default([]),
  pricingTiers: pricingTiersSchema,
  weeklySchedule: z.array(weeklyDaySchema).max(7).default([]),
  languages: z.array(z.string().max(50)).max(10).default([]),
  gymLocations: z.array(z.string().max(200)).max(10).default([]),
});

export async function GET() {
  const user = await requireRole('PT');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ profile: decodeProfile(user.trainerProfile) });
}

export async function PUT(request) {
  const user = await requireRole('PT');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const data = encodeListFields(parsed.data);
  if (data.photoUrl === '') data.photoUrl = null;

  const profile = await prisma.trainerProfile.update({
    where: { userId: user.id },
    data,
  });
  return NextResponse.json({ profile: decodeProfile(profile) });
}
