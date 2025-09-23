// app/api/learning-phases/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { reorderPhases } from '../../learning-templates';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { optionId, phaseId, direction } = await request.json();
    const result = await reorderPhases(optionId, phaseId, direction);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in POST /api/learning-phases/reorder:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reorder phases' },
      { status: 500 }
    );
  }
}