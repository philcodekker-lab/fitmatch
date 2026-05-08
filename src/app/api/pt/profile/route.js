import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { encodeListFields, decodeProfile } from '@/lib/profile';

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
  const profile = await prisma.trainerProfile.update({
    where: { userId: user.id },
    data,
  });
  return NextResponse.json({ profile: decodeProfile(profile) });
}
