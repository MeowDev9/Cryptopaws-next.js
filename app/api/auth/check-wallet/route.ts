import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const role = searchParams.get('role') || 'donor';

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Check if the wallet is already registered for the specified role
    let collectionName = '';
    switch (role.toLowerCase()) {
      case 'welfare':
        collectionName = 'welfares';
        break;
      case 'donor':
        collectionName = 'donors';
        break;
      case 'admin':
        collectionName = 'admins';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid role specified' },
          { status: 400 }
        );
    }

    const user = await db.collection(collectionName).findOne({ 
      $or: [
        { walletAddress: address },
        { blockchainAddress: address }
      ]
    });

    return NextResponse.json({
      isRegistered: !!user,
      role: user ? role : null,
      userId: user?._id
    });

  } catch (error) {
    console.error('Error checking wallet registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
