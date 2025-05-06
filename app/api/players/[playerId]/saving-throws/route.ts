import { updatePlayerSavingThrows } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const playerId = params.playerId;
    const savingThrows = await request.json();
    
    // Update player saving throws
    const updatedPlayer = await updatePlayerSavingThrows(playerId, savingThrows);
    
    // Return the updated player
    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error('API error updating player saving throws:', error);
    return NextResponse.json(
      { error: 'Failed to update player saving throws' },
      { status: 500 }
    );
  }
}