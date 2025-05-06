import { getPlayerSpells } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const playerId = params.playerId;
    
    // Get player first
    const player = { id: playerId };
    
    // Get player spells
    const spells = await getPlayerSpells(player);
    
    // Return the spells
    return NextResponse.json(spells);
  } catch (error) {
    console.error('API error fetching player spells:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player spells' },
      { status: 500 }
    );
  }
}