import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

/**
 * Ensure this file is bundled with its font assets by adding the following to `vercel.json`:
 *
 * {
 *   "functions": {
 *     "api/generate-image.ts": {
 *       "includeFiles": "public/fonts/**"
 *     }
 *   }
 * }
 */

// Force Node runtime ‒ Edge functions don’t expose `fs`.
export const config = {
  runtime: 'nodejs',
};

// Absolute paths to the bundled font files
const fontDir = path.join(process.cwd(), 'public', 'fonts');
const fontRegular = fs.readFileSync(path.join(fontDir, 'StabilGrotesk-Regular.otf'));
const fontBold = fs.readFileSync(path.join(fontDir, 'StabilGrotesk-Bold.otf'));

/**
 * GET /api/generate-image?text=Hello&width=1200&height=630&color=%23000&fontSize=72
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      text = 'Hello',
      width = '1200',
      height = '630',
      color = '#000',
      fontSize = '72',
    } = req.query;

    // 1️⃣ Create SVG with Satori
    const svg = await satori(
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
          fontFamily: 'Stabil',
          color,
          fontSize: Number(fontSize),
        }}
      >
        {text}
      </div>,
      {
        width: Number(width),
        height: Number(height),
        fonts: [
          { name: 'Stabil', data: fontRegular, weight: 400, style: 'normal' },
          { name: 'Stabil', data: fontBold, weight: 700, style: 'normal' },
        ],
      }
    );

    // 2️⃣ Rasterise to PNG with Resvg
    const png = new Resvg(svg, {
      fitTo: { mode: 'width', value: Number(width) },
      background: 'white',
    }).render().asPng();

    // 3️⃣ Send response
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(png);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error?.message ?? 'Failed to generate image' });
  }
}

