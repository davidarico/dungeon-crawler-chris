import { getPlayerByGameAndUser } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Return 401 if no session
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const gameId = params.gameId;
    
    // Get player data
    const player = await getPlayerByGameAndUser(gameId, userId);
    
    // Return the player data
    return NextResponse.json(player || null);
  } catch (error) {
    console.error('API error fetching player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    );
  }
}