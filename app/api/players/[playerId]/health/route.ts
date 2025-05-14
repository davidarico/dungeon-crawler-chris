import { updatePlayerHealth } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const playerId = (await params).playerId;
    const { health } = await request.json();
    
    if (health === undefined || typeof health !== 'number') {
      return NextResponse.json(
        { error: 'Valid health value is required' },
        { status: 400 }
      );
    }
    
    // Update player health
    const updatedPlayer = await updatePlayerHealth(playerId, health);
    
    // Return the updated player
    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error('API error updating player health:', error);
    return NextResponse.json(
      { error: 'Failed to update player health' },
      { status: 500 }
    );
  }
}