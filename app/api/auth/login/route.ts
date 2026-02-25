import { NextResponse } from 'next/server';
import { getTranslator } from '@/lib/i18n';
import { Keypair } from '@stellar/stellar-sdk';
import { getAndClearNonce } from '@/lib/auth-cache';
import {
  createSession,
  getSessionCookieHeader,
} from '../../../../lib/session';

export const dynamic = 'force-dynamic';

/**
 * Wallet-based auth flow:
 * 1. Frontend: user connects wallet (e.g. Freighter), gets address.
 * 2. Frontend: build a nonce message (e.g. "Sign in to Remitwise at {timestamp}").
 * 3. Frontend: sign message with wallet
 * 4. Frontend: POST /api/auth/login with { address, signature }
 * 5. Backend: verify with Keypair using stored server memory nonce; create encrypted session cookie.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, signature } = body;

    if (!address || !signature) {
      const t = getTranslator(request.headers.get('accept-language'));
      return NextResponse.json(
        { error: t('errors.address_signature_required') },
        { status: 400 }
      );
    }

    // Retrieve and clear nonce — returns null if missing or expired
    const nonce = getAndClearNonce(address);
    if (!nonce) {
      const t = getTranslator(request.headers.get('accept-language'));
      return NextResponse.json(
        { error: t('errors.nonce_expired') },
        { status: 401 }
      );
    }

    // Verify signature
    try {
      const keypair = Keypair.fromPublicKey(address);
      // Nonce is verified using utf8 encoding to match the frontend signature
      const isValid = keypair.verify(
        Buffer.from(nonce, 'utf8'),
        Buffer.from(signature, 'base64')
      );

      if (!isValid) {
        const t = getTranslator(request.headers.get('accept-language'));
        return NextResponse.json({ error: t('errors.invalid_signature') }, { status: 401 });
      }
    } catch {
      const t = getTranslator(request.headers.get('accept-language'));
      return NextResponse.json(
        { error: t('errors.signature_verification_failed') },
        { status: 401 }
      );
    }

    const sealed = await createSession(address);
    const cookieHeader = getSessionCookieHeader(sealed);

    return new Response(
      JSON.stringify({ ok: true, address }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );

  } catch (err) {
    console.error('Login error:', err);
    const t = getTranslator(request.headers.get('accept-language'));
    return NextResponse.json({ error: t('errors.internal_server_error') }, { status: 500 });
  }
}
