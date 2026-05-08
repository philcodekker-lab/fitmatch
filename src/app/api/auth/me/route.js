import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { decodeProfile } from '@/lib/profile';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      trainerProfile: decodeProfile(user.trainerProfile),
    },
  });
}
