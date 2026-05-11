export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decodeProfile } from '@/lib/profile';

export async function GET(_request, { params }) {
  const profile = await prisma.trainerProfile.findUnique({
    where: { id: params.id },
    include: { user: { select: { email: true } } },
  });
  if (!profile || !profile.approved) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const decoded = decodeProfile(profile);
  return NextResponse.json({
    trainer: { ...decoded, contactEmail: profile.user.email },
  });
}
