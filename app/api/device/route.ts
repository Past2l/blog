import { db } from '@/database';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as UUIDv4 } from 'uuid';
import { history } from '@/database/schema';

export async function GET(req: NextRequest) {
  let id = req.headers.get('X-Device-ID');
  if (!id)
    while (!id) {
      const generatedUUID = UUIDv4();
      const uuidExist = await db.query.history.findFirst({
        where: eq(history.device_id, generatedUUID),
      });
      if (!uuidExist) id = generatedUUID;
    }
  return NextResponse.json(
    { status: 'success', result: { id } },
    { status: 200 },
  );
}
