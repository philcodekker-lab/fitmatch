import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

const patchSchema = z
  .object({
    approved: z.boolean().optional(),
    featured: z.boolean().optional(),
  })
  .refine((v) => v.approved !== undefined || v.featured !== undefined, {
    message: 'Provide approved and/or featured.',
  });

// PATCH /api/admin/pts/[id]  — toggle approved / featured
export async function PATCH(request, { params }) {
  const admin = await requireRole('ADMIN');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const profile = await prisma.trainerProfile.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json({ ok: true, profile });
}

// DELETE /api/admin/pts/[id] — remove a PT (and their user account)
export async function DELETE(_request, { params }) {
  const admin = await requireRole('ADMIN');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await prisma.trainerProfile.findUnique({ where: { id: params.id } });
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Cascade: deleting the user removes the trainer profile via the relation.
  await prisma.user.delete({ where: { id: profile.userId } });
  return NextResponse.json({ ok: true });
}
