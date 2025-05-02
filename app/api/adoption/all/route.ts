import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Adoption from '@/models/Adoption';

export async function GET() {
  try {
    await connectToDatabase();
    
    const adoptions = await Adoption.find({})
      .populate('postedBy', 'name')
      .populate('adoptedBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(adoptions);
  } catch (error) {
    console.error('Error fetching adoptions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch adoptions' },
      { status: 500 }
    );
  }
} 