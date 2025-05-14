import { getLootbox } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch a specific lootbox by ID from the path param
export async function GET(
  request: NextRequest,
  { params }: { params: { lootboxId: string } }
) {
  try {
    const lootboxId = (await params).lootboxId;
    
    if (!lootboxId) {
      return NextResponse.json({ error: 'Lootbox ID is required' }, { status: 400 });
    }
    
    const lootbox = await getLootbox(lootboxId);
    
    if (!lootbox) {
      return NextResponse.json({ error: 'Lootbox not found' }, { status: 404 });
    }
    
    return NextResponse.json(lootbox);
  } catch (error) {
    console.error('API error fetching lootbox:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lootbox' },
      { status: 500 }
    );
  }
}