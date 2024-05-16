import { GoogleToken, GoogleUserInfo } from '@/types';
import { NextRequest } from 'next/server';

export class Google {
  static getLoginURL(req: NextRequest) {
    return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: `${req.headers.get('x-forwarded-proto')}://${req.headers.get('host')}/api/auth/callback`,
      scope: 'profile email',
      access_type: 'offline',
      include_granted_scopes: 'true',
      response_type: 'code',
    })}`;
  }

  static async getToken(req: NextRequest): Promise<GoogleToken> {
    const data = await fetch('https://accounts.google.com/o/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: req.nextUrl.searchParams.get('code') || '',
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: `${req.headers.get('x-forwarded-proto')}://${req.headers.get('host')}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const result = await data.json();
    if (result.error) throw new Error(result.error);
    return {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    };
  }

  static async refreshToken(token: string): Promise<GoogleToken> {
    const data = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: token,
        grant_type: 'refresh_token',
      }),
    });
    const result = await data.json();
    if (result.error) throw new Error(result.error);
    return {
      access_token: result.access_token,
      refresh_token: token,
    };
  }

  static async getUserInfo(token: string): Promise<GoogleUserInfo> {
    const data = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`,
    );
    return data.json();
  }
}
