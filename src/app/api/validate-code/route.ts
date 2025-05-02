import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    // Parse the JSON body from the request
    const { code } = body;

    // Check if the body has the 'code' property
    if (code === undefined) {
      return NextResponse.json({ error: 'Missing code in body' }, { status: 400 });
    }
    // Secret code to compare against
    const secretCode = 'WHEREISMYCODE25';

    // Compare the received code with the secret code
    if (code === secretCode) {
      // If the codes match, return a successful response
      return NextResponse.json({ valid: true });
    } else {
      // If the codes do not match, return an error response
      return NextResponse.json({ valid: false });
    }
  } catch (error) {
    // If there's an error parsing the JSON, return an error response
    return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
  }
}