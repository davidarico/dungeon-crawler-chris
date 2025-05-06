import { getPlayerSpells } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    // Properly handle params by ensuring it's resolved
    const { playerId } = params;
    
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