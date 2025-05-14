import { updatePlayerAbilityScores } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const playerId = (await params).playerId;
    const abilityScores = await request.json();
    
    // Update player ability scores
    const updatedPlayer = await updatePlayerAbilityScores(playerId, abilityScores);
    
    // Return the updated player
    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error('API error updating player ability scores:', error);
    return NextResponse.json(
      { error: 'Failed to update player ability scores' },
      { status: 500 }
    );
  }
}