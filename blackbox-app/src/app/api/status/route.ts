import { NextResponse } from 'next/server';
import { getAllProviders } from '@/providers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const providers = getAllProviders();
  const statuses = await Promise.all(
    providers.map(async (p) => {
      let isUp = false;
      try {
        isUp = await p.healthCheck();
      } catch (e) {
        isUp = false;
      }
      return { name: p.name, id: p.id, isUp };
    })
  );

  return NextResponse.json(statuses);
}
