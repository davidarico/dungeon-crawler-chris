import { getPlayerSpells } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { playerId: string } }
) {
  try {
    // Access playerId directly from context.params
    const playerId = (await context.params).playerId;
    
    // Call the API function with the playerId directly
    const spells = await getPlayerSpells(playerId);
    
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