import { createPlayer } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

// POST: Create a new player for a game
export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Return 401 if no session
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await request.json();
    const { gameId, name } = body;
    
    // Validate request
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Valid player name is required' }, { status: 400 });
    }
    
    // Create the player
    const player = await createPlayer(gameId, userId, name.trim());
    
    // Return the created player
    return NextResponse.json(player);
  } catch (error) {
    console.error('API error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}