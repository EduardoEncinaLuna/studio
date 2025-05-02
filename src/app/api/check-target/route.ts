
import { NextRequest, NextResponse } from 'next/server';
type PositionPayload = {
  imageId: string;
  x: number;
  y: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  width: number;
};
const targets = [
  { imageId: 1, x:556, y: 277, x2: 472, y2:235 , x3:332 , y3:162 , radius: 20 },
  { imageId: 2, x: 23, y: 111, x2: 20, y2:95 , x3:15 , y3:67 , radius: 20 },
  { imageId: 3, x: 1049, y: 571, x2: 894, y2:485 , x3:624 , y3:341 , radius: 20 },//85.12 & 82.66
  { imageId: 4, x: 1422, y: 453, x2: 1214, y2:386 , x3:850 , y3:269 , radius: 20 },
  { imageId: 5, x: 303, y: 417, x2: 250, y2:352 , x3:177 , y3:249 , radius: 20 },
  { imageId: 6, x: 1377, y: 780, x2: 1170, y2:664 , x3:820 , y3:469 , radius: 20 },
  { imageId: 7, x: 392, y: 252, x2: 332, y2:214 , x3:234 , y3:152 , radius: 20 },
  { imageId: 8, x: 1115, y: 282, x2: 952, y2:240 , x3:670 , y3:168 , radius: 20 },
  { imageId: 9, x: 935, y: 271, x2: 796, y2:231 , x3:556 , y3:160 , radius: 20 },
  { imageId: 10, x: 142, y: 782, x2: 121, y2:664 , x3:87 , y3:446 , radius: 20 },
];

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    const { imageId, x, y, width } = body as PositionPayload;

    if (
      typeof imageId !== 'number' ||
      typeof x !== 'number' ||
      typeof y !== 'number' ||
      typeof width !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
  
    const target = targets.find((t) => t.imageId === imageId);
  
    if (!target) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
  
    let distance = 0;
    if(width == 1490)
      distance = Math.sqrt(
        Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)
      );
    else if(width == 1270)
      distance = Math.sqrt(
        Math.pow(x - target.x2, 2) + Math.pow(y - target.y2, 2)
      );
    else if(width == 890)
      distance = Math.sqrt(
        Math.pow(x - target.x3, 2) + Math.pow(y - target.y3, 2)
      );
  
    if (distance <= target.radius) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
  }

  
}