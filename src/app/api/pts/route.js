export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decodeProfile } from '@/lib/profile';

// Public listing of approved PTs. Featured PTs first.
export async function GET() {
  const profiles = await prisma.trainerProfile.findMany({
    where: { approved: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ trainers: profiles.map(decodeProfile) });
}
