import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_VERIFY = 'https://api.paystack.co/transaction/verify';

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Verify with Paystack
    const verifyResponse = await fetch(`${PAYSTACK_VERIFY}/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });

    const paystackData = await verifyResponse.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    const messageId = paystackData.data.metadata.messageId;

    // Update transaction
    await supabase
      .from('transactions')
      .update({
        status: 'success',
        verified_at: new Date().toISOString(),
      })
      .eq('reference', reference);

    // Update message
    await supabase
      .from('messages')
      .update({
        payment_status: 'paid',
        transaction_ref: reference,
      })
      .eq('id', messageId);

    return NextResponse.json({
      success: true,
      message: 'Payment verified',
      messageId,
    });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}