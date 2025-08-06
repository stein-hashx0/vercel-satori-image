export const config = {
  runtime: 'nodejs',
};

import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { text = 'Hello World', fontSize = 48, color = '#000000', width = 800 } = req.query;

  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf');
  const fontData = fs.readFileSync(fontPath);

  const svg = await satori(
    {
      type: 'div',
      props: {
        children: text,
        style: {
          fontSize: Number(fontSize),
          color: color,
          fontFamily: 'Inter',
        },
      },
    },
    {
      width: Number(width),
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );

  const resvg = new Resvg(svg);
  const pngBuffer = resvg.render().asPng();

  res.setHeader('Content-Type', 'image/png');
  res.send(pngBuffer);
}
