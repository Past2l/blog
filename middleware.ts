import { NextRequest, NextResponse } from 'next/server';
import { Google } from './modules/server';

export async function middleware(req: NextRequest) {
  try {
    req.headers.delete('X-User-ID');
    let accessToken = req.headers.get('Authorization');
    const refreshToken = req.cookies.get('token')?.value;
    const headers = new Headers(req.headers);
    if (!accessToken && refreshToken) {
      const token = await Google.refreshToken(refreshToken);
      accessToken = token.access_token;
    }
    if (accessToken) {
      const user = await Google.getUserInfo(accessToken);
      headers.set('X-User-ID', user.id);
    }
    return NextResponse.next({ request: { headers } });
  } catch (e) {
    const res = NextResponse.next();
    res.cookies.delete('token');
    return res;
  }
}

export const config = {
  matcher: '/api/(.*)',
};
