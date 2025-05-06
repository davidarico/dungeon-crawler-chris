import { getSpells } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all spells
export async function GET(request: NextRequest) {
  try {
    // Fetch all spells
    const spells = await getSpells();
    return NextResponse.json(spells);
  } catch (error) {
    console.error('API error fetching spells:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spells' },
      { status: 500 }
    );
  }
}