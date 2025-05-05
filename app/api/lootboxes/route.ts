import { getLootboxes, getLootbox } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all lootboxes or a specific lootbox
export async function GET(request: NextRequest) {
  try {
    // Check if a lootbox ID was provided as a query parameter
    const { searchParams } = new URL(request.url);
    const lootboxId = searchParams.get('id');
    
    if (lootboxId) {
      // Fetch a specific lootbox
      const lootbox = await getLootbox(lootboxId);
      
      if (!lootbox) {
        return NextResponse.json({ error: 'Lootbox not found' }, { status: 404 });
      }
      
      return NextResponse.json(lootbox);
    } else {
      // Fetch all lootboxes
      const lootboxes = await getLootboxes();
      return NextResponse.json(lootboxes);
    }
  } catch (error) {
    console.error('API error fetching lootboxes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lootboxes' },
      { status: 500 }
    );
  }
}