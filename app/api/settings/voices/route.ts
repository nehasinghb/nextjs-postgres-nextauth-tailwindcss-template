// app/api/settings/voices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// GET - Fetch available AI voices
export async function GET(request: NextRequest) {
  try {
    console.log('[Voices API] GET request received');
    
    const session = await auth();
    
    if (!session || !session.user) {
      console.log('[Voices API] No session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Read voice metadata from public/voices directory
    const voicesPath = path.join(process.cwd(), 'public', 'voices', 'voice_metadata.json');
    
    console.log('[Voices API] Reading metadata from:', voicesPath);
    
    if (!fs.existsSync(voicesPath)) {
      console.error('[Voices API] voice_metadata.json not found');
      return NextResponse.json(
        { error: 'Voice metadata not found' },
        { status: 404 }
      );
    }

    const metadata = JSON.parse(fs.readFileSync(voicesPath, 'utf-8'));
    
    console.log('[Voices API] Found voices:', metadata.voices.length);

    return NextResponse.json({
      voices: metadata.voices.map((voice: any) => ({
        id: voice.id,
        friendly_name: voice.friendly_name,
        type: voice.type,
        sample_text: voice.sample_text,
        audio_url: `/voices/${voice.filename}`
      }))
    });
  } catch (error: any) {
    console.error('[Voices API] Error fetching voices:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}