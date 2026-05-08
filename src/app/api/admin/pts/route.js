import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { decodeProfile } from '@/lib/profile';

export async function GET() {
  const admin = await requireRole('ADMIN');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profiles = await prisma.trainerProfile.findMany({
    orderBy: [{ approved: 'asc' }, { createdAt: 'desc' }],
    include: { user: { select: { email: true } } },
  });

  const trainers = profiles.map((p) => ({
    ...decodeProfile(p),
    email: p.user.email,
  }));
  return NextResponse.json({ trainers });
}
