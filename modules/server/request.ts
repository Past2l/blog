import { NextRequest } from 'next/server';

export const getOSfromUserAgent = (req: NextRequest) => {
  const agent = req.headers.get('user-agent') || '';
  return /Android/i.test(agent)
    ? 'Android'
    : /iPhone|iPod/i.test(agent)
      ? 'iOS'
      : /iPad/i.test(agent)
        ? 'iPadOS'
        : /Macintosh|Mac OS X/i.test(agent)
          ? 'macOS'
          : /Windows/i.test(agent)
            ? 'Windows'
            : /Linux/i.test(agent)
              ? 'Linux'
              : 'Other';
};

export const getIP = (req: NextRequest) => {
  const header = req.headers.get('X-Forwarded-For')!;
  return header == '::1'
    ? '127.0.0.1'
    : header.replace(/,.*/g, '').replace(/::ffff:/g, '');
};
