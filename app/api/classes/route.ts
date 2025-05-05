import { getClass, getClasses } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all classes or a specific class
export async function GET(request: NextRequest) {
  try {
    // Check if a class ID was provided as a query parameter
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('id');
    
    if (classId) {
      // Fetch a specific class
      const classData = await getClass(classId);
      
      if (!classData) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }
      
      return NextResponse.json(classData);
    } else {
      // Fetch all classes
      const classes = await getClasses();
      return NextResponse.json(classes);
    }
  } catch (error) {
    console.error('API error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}