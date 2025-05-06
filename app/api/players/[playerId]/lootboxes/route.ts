import { getPlayerLootboxes, removeLootboxFromPlayer } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    // Properly handle params by ensuring it's resolved
    const { playerId } = params;
    
    // Get player lootboxes directly using the playerId
    const lootboxes = await getPlayerLootboxes(playerId);
    
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
    // Properly handle params by ensuring it's resolved
    const { playerId } = params;
    const lootboxId = searchParams.get('lootboxId');
    
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