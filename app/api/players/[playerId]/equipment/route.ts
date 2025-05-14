import { getPlayerEquippedItems, equipItem, unequipItem } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';
import { EquipSlot } from '@/lib/types';

export async function GET(
  request: NextRequest,
  context: { params: { playerId: string } }
) {
  try {
    // Best practice is to access playerId without destructuring
    const playerId = (await context.params).playerId;
    
    // Get equipped items
    const equippedItems = await getPlayerEquippedItems(playerId);
    
    // Return the equipped items
    return NextResponse.json(equippedItems);
  } catch (error) {
    console.error('API error fetching equipped items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipped items' },
      { status: 500 }
    );
  }
}

// Equip an item
export async function POST(
  request: NextRequest,
  context: { params: { playerId: string } }
) {
  try {
    const { itemId, slot } = await request.json();
    const playerId = (await context.params).playerId;
    
    if (!itemId || !slot) {
      return NextResponse.json(
        { error: 'Item ID and slot are required' },
        { status: 400 }
      );
    }
    
    // Equip the item
    await equipItem(playerId, itemId, slot);
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error equipping item:', error);
    return NextResponse.json(
      { error: 'Failed to equip item' },
      { status: 500 }
    );
  }
}

// Unequip an item
export async function DELETE(
  request: NextRequest,
  context: { params: { playerId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const slotParam = searchParams.get('slot');
    const playerId = (await context.params).playerId;
    
    if (!slotParam) {
      return NextResponse.json(
        { error: 'Slot is required' },
        { status: 400 }
      );
    }
    
    // Validate that the slot is a valid EquipSlot
    const validSlots = ["weapon", "shield", "head", "chest", "legs", "hands", "feet", "neck", "ring"];
    if (!validSlots.includes(slotParam)) {
      return NextResponse.json(
        { error: 'Invalid equipment slot' },
        { status: 400 }
      );
    }
    
    // Cast the validated slot parameter to EquipSlot type
    const slot = slotParam as EquipSlot;
    
    // Unequip the item
    await unequipItem(playerId, slot);
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error unequipping item:', error);
    return NextResponse.json(
      { error: 'Failed to unequip item' },
      { status: 500 }
    );
  }
}