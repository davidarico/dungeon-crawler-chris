import { getItems } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all items
export async function GET(request: NextRequest) {
  try {
    // Fetch all items
    const items = await getItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error('API error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}