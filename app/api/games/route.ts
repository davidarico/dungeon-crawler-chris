import { getGames, createGame } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all games for the current user
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    
    // Return 401 if no session
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get games for user
    const games = await getGames(session.user.id);
    
    // Return the games
    return NextResponse.json(games);
  } catch (error) {
    console.error('API error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

// POST: Create a new game
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    
    // Return 401 if no session
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const { name } = await request.json();
    
    // Validate request
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Game name is required' }, 
        { status: 400 }
      );
    }
    
    // Create the game
    const newGame = await createGame(name, session.user.id);
    
    // Return the new game
    return NextResponse.json(newGame);
  } catch (error) {
    console.error('API error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}