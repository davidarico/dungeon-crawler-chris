import { getGame, getGamePlayers } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    gameId: string;
  };
}

// GET: Fetch a specific game by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { gameId } = params;
    
    // Get user session
    const session = await getServerSession();
    
    // Return 401 if no session
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the specific game with user context
    const game = await getGame(gameId, session.user.id);
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Return the game
    return NextResponse.json(game);
  } catch (error) {
    console.error(`API error fetching game ${params.gameId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a game
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { gameId } = params;
    
    // Get user session
    const session = await getServerSession();
    
    // Return 401 if no session
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Implementation for deleting a game would go here
    // For now, return a placeholder response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API error deleting game ${params.gameId}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    );
  }
}