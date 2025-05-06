import { getPlayerByGameAndUser } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

// GET: Check if a user is already a player in a specific game
export async function GET(request: NextRequest) {
  try {
    // Get game ID and user ID from query params
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    
    // Get user from session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Return 401 if no session
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Return 400 if no gameId
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    // Check if player exists in this game
    const player = await getPlayerByGameAndUser(gameId, userId);
    
    // Return the result
    return NextResponse.json({ player: player || null, exists: !!player });
  } catch (error) {
    console.error('API error checking player existence:', error);
    return NextResponse.json(
      { error: 'Failed to check player existence' },
      { status: 500 }
    );
  }
}