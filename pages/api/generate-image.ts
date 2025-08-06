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

  // Load Stabil Grotesk Regular font
  const fontPath = path.join(process.cwd(), 'public/fonts/StabilGrotesk-Regular.otf');
  const fontData = fs.readFileSync(fontPath);

  // Create SVG using Satori
  const svg = await satori(
    <div
      style={{
        fontFamily: 'Stabil Grotesk',
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
      height: 400,
      fonts: [
        {
          name: 'Stabil Grotesk',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );

  // Convert SVG to PNG with Resvg
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new ImageResponse(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
