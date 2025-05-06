import { getPlayerItems, addItemToPlayer, removeItemFromPlayer } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const playerId = params.playerId;
    
    // Get player first
    const player = { id: playerId };
    
    // Get player items
    const items = await getPlayerItems(player);
    
    // Return the items
    return NextResponse.json(items);
  } catch (error) {
    console.error('API error fetching player items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player items' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const { itemId } = await request.json();
    const playerId = params.playerId;
    
    // Add item to player
    const updatedPlayer = await addItemToPlayer(playerId, itemId);
    
    // Return the updated player
    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error('API error adding item to player:', error);
    return NextResponse.json(
      { error: 'Failed to add item to player' },
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
    const itemId = searchParams.get('itemId');
    const playerId = params.playerId;
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }
    
    // Remove item from player
    const updatedPlayer = await removeItemFromPlayer(playerId, itemId);
    
    // Return the updated player
    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error('API error removing item from player:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from player' },
      { status: 500 }
    );
  }
}