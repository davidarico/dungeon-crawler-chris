import { getClasses } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all classes
export async function GET(request: NextRequest) {
  try {
    // Fetch all classes
    const classes = await getClasses();
    return NextResponse.json(classes);
  } catch (error) {
    console.error('API error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}