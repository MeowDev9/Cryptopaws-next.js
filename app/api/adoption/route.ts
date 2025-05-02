import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Adoption from '@/models/Adoption';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const formData = await request.formData();
    
    // Handle file uploads
    const images: string[] = [];
    const imageFiles = formData.getAll('images') as File[];
    
    for (const file of imageFiles) {
      if (file instanceof File) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Save the file to the public/uploads directory
        const path = join(process.cwd(), 'public/uploads', file.name);
        await writeFile(path, buffer);
        
        images.push(`/uploads/${file.name}`);
      }
    }
    
    // Create adoption record
    const adoption = await Adoption.create({
      name: formData.get('name'),
      type: formData.get('type'),
      breed: formData.get('breed'),
      age: formData.get('age'),
      gender: formData.get('gender'),
      size: formData.get('size'),
      description: formData.get('description'),
      location: formData.get('location'),
      health: formData.get('health'),
      behavior: formData.get('behavior'),
      images,
      status: 'available',
      postedBy: formData.get('postedByType') === 'donor' ? 'donor_id' : 'welfare_id', // Replace with actual user ID
      createdAt: new Date(),
    });
    
    return NextResponse.json(adoption);
  } catch (error) {
    console.error('Error creating adoption:', error);
    return NextResponse.json(
      { message: 'Failed to create adoption listing' },
      { status: 500 }
    );
  }
} 