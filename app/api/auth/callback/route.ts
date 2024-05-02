import { UserService } from '@/database/services/user';
import { Google, errorMessage } from '@/modules/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = await Google.getToken(req);
    const user = await Google.getUserInfo(token.access_token);
    if (!(await UserService.get(user.id)))
      UserService.create({
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        owner: false,
      });
    const res = NextResponse.json({ status: 'success', result: token });
    res.cookies.set('token', token.refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}
