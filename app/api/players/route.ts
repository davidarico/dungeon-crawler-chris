import { getPlayer, getPlayers } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all players or a specific player
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    
    // Return 401 if no session
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if a player ID was provided as a query parameter
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('id');
    
    if (playerId) {
      // Fetch a specific player
      const player = await getPlayer(playerId);
      
      if (!player) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 });
      }
      
      return NextResponse.json(player);
    } else {
      // Fetch all players (for the current user)
      const players = await getPlayers(session.user.id);
      return NextResponse.json(players);
    }
  } catch (error) {
    console.error('API error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}