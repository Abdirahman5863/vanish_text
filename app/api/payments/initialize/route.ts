import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_API = 'https://api.paystack.co/transaction/initialize';

export async function POST(req: NextRequest) {
  try {
    const { email, messageId } = await req.json();

    if (!email || !messageId) {
      return NextResponse.json(
        { error: 'Email and messageId are required' },
        { status: 400 }
      );
    }

    // Verify message exists
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .select('id, payment_status')
      .eq('id', messageId)
      .single();

    if (msgError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Generate unique reference
    const reference = `VANISH_${messageId.substring(0, 8)}_${Date.now()}`;

    // Initialize Paystack transaction
    const paystackResponse = await fetch(PAYSTACK_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
      body: JSON.stringify({
        email,
        amount: 2000, // 20 KSH in cents
        reference,
        metadata: {
          messageId,
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 400 }
      );
    }

    // Store transaction
    await supabase.from('transactions').insert([
      {
        reference,
        message_id: messageId,
        amount: 2000,
        currency: 'KES',
        status: 'pending',
      },
    ]);

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackData.data.authorization_url,
      accessCode: paystackData.data.access_code,
      reference,
    });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
