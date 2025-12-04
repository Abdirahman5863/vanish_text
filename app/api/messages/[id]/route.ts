import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // NEXT.JS 16 FIX: Await params!
    const { id } = await params;

    console.log('Fetching message with ID:', id);

    // Fetch message
    const { data: message, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if already viewed
    if (message.viewed_at) {
      return NextResponse.json(
        { error: 'Message has already been viewed and deleted' },
        { status: 410 }
      );
    }

    // Check if expired
    if (new Date() > new Date(message.expires_at)) {
      return NextResponse.json(
        { error: 'Message has expired' },
        { status: 410 }
      );
    }

    // Mark as viewed
    const { error: updateError } = await supabase
      .from('messages')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    // Schedule deletion after 5 seconds
    setTimeout(async () => {
      await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
    }, 5000);

    return NextResponse.json({
      success: true,
      message: message.text,
      viewedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}