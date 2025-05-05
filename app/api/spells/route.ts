import { getSpells, getSpell } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all spells or a specific spell
export async function GET(request: NextRequest) {
  try {
    // Check if a spell ID was provided as a query parameter
    const { searchParams } = new URL(request.url);
    const spellId = searchParams.get('id');
    
    if (spellId) {
      // Fetch a specific spell
      const spell = await getSpell(spellId);
      
      if (!spell) {
        return NextResponse.json({ error: 'Spell not found' }, { status: 404 });
      }
      
      return NextResponse.json(spell);
    } else {
      // Fetch all spells
      const spells = await getSpells();
      return NextResponse.json(spells);
    }
  } catch (error) {
    console.error('API error fetching spells:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spells' },
      { status: 500 }
    );
  }
}