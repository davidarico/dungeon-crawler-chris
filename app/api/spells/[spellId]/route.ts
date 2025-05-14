import { getSpell } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch a specific spell by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { spellId: string } }
) {
  try {
    const spellId = (await params).spellId;
    
    if (!spellId) {
      return NextResponse.json({ error: 'Spell ID is required' }, { status: 400 });
    }
    
    const spell = await getSpell(spellId);
    
    if (!spell) {
      return NextResponse.json({ error: 'Spell not found' }, { status: 404 });
    }
    
    return NextResponse.json(spell);
  } catch (error) {
    console.error('API error fetching spell:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spell' },
      { status: 500 }
    );
  }
}