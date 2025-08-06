import { NextRequest } from 'next/server';
import { ImageResponse } from '@vercel/og';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const text = searchParams.get('text') || 'Hello World';
  const fontSize = parseInt(searchParams.get('fontSize') || '48', 10);
  const color = searchParams.get('color') || '#000000';
  const width = parseInt(searchParams.get('width') || '800', 10);
  const height = 400;

  // Read StabilGrotesk font files (Regular and Bold for demo)
  const fontRegular = fs.readFileSync(
    path.resolve(process.cwd(), 'public/fonts/StabilGrotesk-Regular.otf')
  );

  const fontBold = fs.readFileSync(
    path.resolve(process.cwd(), 'public/fonts/StabilGrotesk-Bold.otf')
  );

  // Create SVG using Satori
  const svg = await satori(
    <div
      style={{
        fontFamily: 'StabilGrotesk',
        fontWeight: 400,
        fontSize,
        color,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {text}
    </div>,
    {
      width,
      height,
      fonts: [
        {
          name: 'StabilGrotesk',
          data: fontRegular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'StabilGrotesk',
          data: fontBold,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  // Convert SVG to PNG using Resvg
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });

  const png = resvg.render().asPng();

  return new ImageResponse(png, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
