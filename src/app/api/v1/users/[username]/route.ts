import { NextRequest, NextResponse } from 'next/server';
import user from 'models/user';
import { NotFoundError, InternalServerError } from 'infra/errors';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const foundUser = await user.findByUsername(username);
    return NextResponse.json({ data: foundUser });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(error, { status: error.statusCode });
    }
    const internalError = new InternalServerError({ cause: error });
    console.error(internalError);
    return NextResponse.json(internalError, { status: internalError.statusCode });
  }
}
