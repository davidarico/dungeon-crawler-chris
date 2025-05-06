import { getLootboxes } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all lootboxes
export async function GET(request: NextRequest) {
  try {
    // Fetch all lootboxes
    const lootboxes = await getLootboxes();
    return NextResponse.json(lootboxes);
  } catch (error) {
    console.error('API error fetching lootboxes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lootboxes' },
      { status: 500 }
    );
  }
}