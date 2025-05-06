import { updatePlayerFollowers } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const playerId = params.playerId;
    const { followers, trending } = await request.json();
    
    if (followers === undefined || trending === undefined) {
      return NextResponse.json(
        { error: 'Both followers and trending values are required' },
        { status: 400 }
      );
    }
    
    // Update player followers
    const updatedPlayer = await updatePlayerFollowers(playerId, followers, trending);
    
    // Return the updated player
    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error('API error updating player followers:', error);
    return NextResponse.json(
      { error: 'Failed to update player followers' },
      { status: 500 }
    );
  }
}