import { NextRequest, NextResponse } from 'next/server';
import user from 'models/user';
import { ValidationError } from 'infra/errors';

export async function POST(request: NextRequest) {
  const userInput = await request.json();
  try {
    const createdUser = await user.create(userInput);
    return NextResponse.json({ data: createdUser }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(error, { status: error.statusCode });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
