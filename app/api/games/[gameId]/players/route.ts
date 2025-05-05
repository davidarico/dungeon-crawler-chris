import { getGamePlayers } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    gameId: string;
  };
}

// GET: Fetch all players for a specific game
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { gameId } = params;
    
    // Get user session
    const session = await getServerSession();
    
    // Return 401 if no session
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get players for the specified game
    const players = await getGamePlayers(gameId);
    
    // Return the players
    return NextResponse.json(players);
  } catch (error) {
    console.error(`API error fetching players for game ${params.gameId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}