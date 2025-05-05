import { getItems, getItem } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all items or a specific item
export async function GET(request: NextRequest) {
  try {
    // Check if an item ID was provided as a query parameter
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');
    
    if (itemId) {
      // Fetch a specific item
      const item = await getItem(itemId);
      
      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      
      return NextResponse.json(item);
    } else {
      // Fetch all items
      const items = await getItems();
      return NextResponse.json(items);
    }
  } catch (error) {
    console.error('API error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}