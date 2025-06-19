import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, provider = 'elevenlabs', voiceId, stability, similarity_boost, style } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for TTS' },
        { status: 400 }
      );
    }

    if (provider === 'elevenlabs') {
      return await handleElevenLabsTTS(text, { voiceId, stability, similarity_boost, style });
    }

    return NextResponse.json(
      { error: 'Only ElevenLabs TTS provider is supported' },
      { status: 400 }
    );

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

async function handleElevenLabsTTS(text: string, options: {
  voiceId?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
} = {}) {
  // Debug logging
  console.log('TTS Request received:', { textLength: text.length, options });
  
  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  
  // Debug API key status (without exposing the key)
  console.log('API Key status:', { 
    hasKey: !!apiKey, 
    isPlaceholder: apiKey === 'your_elevenlabs_api_key_here',
    keyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'none'
  });
  
  if (!apiKey || apiKey === 'your_elevenlabs_api_key_here') {
    console.error('ElevenLabs API key not configured');
    return NextResponse.json(
      { 
        error: 'ElevenLabs API key not configured properly',
        details: 'Please add a valid ELEVENLABS_API_KEY to your .env.local file. Get your API key from https://elevenlabs.io/app/speech-synthesis',
        setup: 'Create a .env.local file in the root directory and add: ELEVENLABS_API_KEY=your_actual_api_key_here'
      },
      { status: 500 }
    );
  }

  try {
    // Use the provided voice ID or default to Adam voice (free tier compatible)
    const voiceId = options.voiceId || 'pNInz6obpgDQGcFmaJgB'; 
    
    console.log('Making request to ElevenLabs with voice:', voiceId);
    
    const requestBody = {
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: options.stability ?? 0.5,
        similarity_boost: options.similarity_boost ?? 0.75,
        style: options.style ?? 0.0,
        use_speaker_boost: true
      }
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    console.log('ElevenLabs response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      let errorMessage = `ElevenLabs API error: ${response.status}`;
      let details = errorText;
      
      if (response.status === 401) {
        errorMessage = 'Invalid ElevenLabs API key';
        details = 'Please check your API key is correct and valid. Get it from https://elevenlabs.io/app/speech-synthesis';
      } else if (response.status === 402) {
        errorMessage = 'ElevenLabs quota exceeded';
        details = 'You have reached your monthly character limit. Upgrade your plan or wait for quota reset.';
      } else if (response.status === 422) {
        errorMessage = 'Invalid request to ElevenLabs API';
        details = 'Check the voice ID and settings are valid';
      } else if (response.status === 404) {
        errorMessage = 'Voice not found';
        details = 'The specified voice ID does not exist or is not accessible with your API key';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: details,
          status: response.status,
          voiceId: voiceId
        },
        { status: 500 }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('Audio buffer received, size:', audioBuffer.byteLength);
    
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
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
