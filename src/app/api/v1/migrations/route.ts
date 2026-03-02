import { NextResponse } from 'next/server';
import migrator from 'models/migrator';

export async function GET() {
  const pendingMigrations = await migrator.listPendingMigrations();
  return NextResponse.json(pendingMigrations);
}

export async function POST() {
  const executedMigrations = await migrator.runPendingMigrations();
  if (executedMigrations.length === 0) {
    return NextResponse.json(executedMigrations, { status: 200 });
  }
  return NextResponse.json(executedMigrations, { status: 201 });
}
