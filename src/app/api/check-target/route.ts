
import { NextRequest, NextResponse } from 'next/server';
type PositionPayload = {
  imageId: string;
  x: number;
  y: number;
};
const targets = [
  { imageId: 1, x:556, y: 277, radius: 30 },
  { imageId: 2, x: 23, y: 111, radius: 30 },
  { imageId: 3, x: 1049, y: 571, radius: 30 },
  { imageId: 4, x: 1422, y: 453, radius: 30 },
  { imageId: 5, x: 303, y: 417, radius: 30 },
  { imageId: 6, x: 1377, y: 780, radius: 30 },
  { imageId: 7, x: 392, y: 252, radius: 30 },
  { imageId: 8, x: 1115, y: 282, radius: 30 },
  { imageId: 9, x: 935, y: 271, radius: 30 },
  { imageId: 10, x: 142, y: 782, radius: 30 },
];

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    const { imageId, x, y } = body as PositionPayload;

    if (
      typeof imageId !== 'number' ||
      typeof x !== 'number' ||
      typeof y !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
  
    const target = targets.find((t) => t.imageId === imageId);
  
    if (!target) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
  
    const distance = Math.sqrt(
      Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)
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