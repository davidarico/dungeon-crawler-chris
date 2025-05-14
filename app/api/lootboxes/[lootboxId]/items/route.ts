import { getLootboxItems } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';
import { Lootbox } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { lootboxId: string } }
) {
  try {
    const lootboxId = (await params).lootboxId;
    
    // Create a complete lootbox object with all required properties
    const lootbox: Lootbox = { 
      id: lootboxId,
      name: "Lootbox", // Default name
      tier: "Bronze", // Default tier
      possibleItems: [] // Empty array for possibleItems
    };
    
    // Get lootbox items
    const items = await getLootboxItems(lootbox);
    
    // Return the items
    return NextResponse.json(items);
  } catch (error) {
    console.error('API error fetching lootbox items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lootbox items' },
      { status: 500 }
    );
  }
}