import { getGame, getGamePlayers, getItems, getLootboxes } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all data needed for the lootbox page
export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const gameId = (await params).gameId;
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Return 401 if no session
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all the data needed for the lootbox page
    const game = await getGame(gameId, session.user.id);
    
    // If game doesn't exist or user is not the DM, return 404/403
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    if (!game.isDM) {
      return NextResponse.json({ error: 'Not authorized as DM' }, { status: 403 });
    }

    // Get all required data
    const players = await getGamePlayers(gameId);
    const items = await getItems();
    const lootboxes = await getLootboxes();
    
    // Return all data in one response
    return NextResponse.json({
      game,
      players,
      items,
      lootboxes
    });
  } catch (error) {
    console.error('API error fetching lootbox data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lootbox data' },
      { status: 500 }
    );
  }
}
