import { getGame, getGamePlayers } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    gameId: string;
  };
}

// GET: Fetch a specific game by ID
export async function GET(
  request: NextRequest,
  context: { params: { gameId: string } }
) {
  try {
    // Access gameId directly from context.params
    const gameId = (await context.params).gameId;
    const { searchParams } = new URL(request.url);
    const isInvite = searchParams.get('invite') === 'true';
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    // For invite links, we allow fetching basic game info without authentication
    if (isInvite) {
      // Get the specific game without user context
      const game = await getGame(gameId);
      
      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      }
      
      // Return just the basic game info needed for the invite page
      return NextResponse.json({
        id: game.id,
        name: game.name
      });
    }
    
    // For non-invite requests, require authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the specific game with user context
    const game = await getGame(gameId, session.user.id);
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Return the game with all details
    return NextResponse.json(game);
  } catch (error) {
    console.error(`API error fetching game:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a game
export async function DELETE(
  request: NextRequest,
  context: { params: { gameId: string } }
) {
  try {
    // Access gameId directly from context.params
    const gameId = context.params.gameId;
    
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
    console.error(`API error deleting game:`, error);
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    );
  }
}