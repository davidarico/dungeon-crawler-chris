import { getPlayerLootboxes, removeLootboxFromPlayer } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const playerId = params.playerId;
    
    // Get player first
    const player = { id: playerId };
    
    // Get player lootboxes
    const lootboxes = await getPlayerLootboxes(player);
    
    // Return the lootboxes
    return NextResponse.json(lootboxes);
  } catch (error) {
    console.error('API error fetching player lootboxes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player lootboxes' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const lootboxId = searchParams.get('lootboxId');
    const playerId = params.playerId;
    
    if (!lootboxId) {
      return NextResponse.json(
        { error: 'Lootbox ID is required' },
        { status: 400 }
      );
    }
    
    // Remove lootbox from player
    const updatedPlayer = await removeLootboxFromPlayer(playerId, lootboxId);
    
    // Return the updated player
    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error('API error removing lootbox from player:', error);
    return NextResponse.json(
      { error: 'Failed to remove lootbox from player' },
      { status: 500 }
    );
  }
}