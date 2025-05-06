import { updatePlayerGold } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const playerId = params.playerId;
    const { gold } = await request.json();
    
    if (gold === undefined) {
      return NextResponse.json(
        { error: 'Gold value is required' },
        { status: 400 }
      );
    }
    
    // Update player gold
    const updatedPlayer = await updatePlayerGold(playerId, gold);
    
    // Return the updated player
    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error('API error updating player gold:', error);
    return NextResponse.json(
      { error: 'Failed to update player gold' },
      { status: 500 }
    );
  }
}