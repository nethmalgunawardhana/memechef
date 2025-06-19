import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, provider = 'elevenlabs' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for TTS' },
        { status: 400 }
      );
    }

    if (provider === 'elevenlabs') {
      return await handleElevenLabsTTS(text);
    }

    // For browser TTS, just return the text
    return NextResponse.json({ 
      message: 'Text prepared for browser TTS',
      text: text,
      audioUrl: null 
    });

  } catch (error) {
    console.error('Error in TTS service:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process TTS request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleElevenLabsTTS(text: string) {
  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  
  if (!apiKey || apiKey === 'your_elevenlabs_api_key_here') {
    return NextResponse.json(
      { 
        error: 'ElevenLabs API key not configured properly',
        details: 'Please add a valid ELEVENLABS_API_KEY to your .env.local file',
        fallback: true
      },
      { status: 500 }
    );
  }

  try {
    // Use a free voice ID that should work with most accounts
    // Adam voice is usually available in free tier
    const voiceId = 'pNInz6obpgDQGcFmaJgB'; 
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      let errorMessage = `ElevenLabs API error: ${response.status}`;
      if (response.status === 401) {
        errorMessage = 'Invalid ElevenLabs API key';
      } else if (response.status === 402) {
        errorMessage = 'ElevenLabs quota exceeded. Upgrade your plan or try again later.';
      } else if (response.status === 422) {
        errorMessage = 'Invalid request to ElevenLabs API';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorText,
          fallback: true
        },
        { status: 500 }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate speech with ElevenLabs',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      },
      { status: 500 }
    );
  }
}
