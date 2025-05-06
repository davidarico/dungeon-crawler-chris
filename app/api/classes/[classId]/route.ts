import { getClass } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch a specific class by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const classId = params.classId;
    
    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }
    
    const classData = await getClass(classId);
    
    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    
    return NextResponse.json(classData);
  } catch (error) {
    console.error('API error fetching class:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    );
  }
}