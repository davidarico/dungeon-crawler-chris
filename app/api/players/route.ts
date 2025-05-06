import { getPlayers } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all players
export async function GET(request: NextRequest) {
  try {
    const players = await getPlayers();
    return NextResponse.json(players);
  } catch (error) {
    console.error('API error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}