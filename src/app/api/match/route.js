import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { decodeProfile } from '@/lib/profile';
import { rankTrainers } from '@/lib/matching';

export const dynamic = 'force-dynamic';

const schema = z.object({
  goal: z.string(),
  experience: z.string(),
  trainingStyle: z.string(),
  budget: z.string(),
  location: z.string().optional().default(''),
});

// Returns up to 10 ranked matches. The UI highlights the top 3 and lets the
// user expand to see the rest.
export async function POST(request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid quiz input.' }, { status: 400 });
  }

  const profiles = await prisma.trainerProfile.findMany({
    where: { approved: true },
  });
  const decoded = profiles.map(decodeProfile);
  const ranked = rankTrainers(decoded, parsed.data, 10);
  return NextResponse.json({ matches: ranked });
}
