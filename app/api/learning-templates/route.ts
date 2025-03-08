// app/api/learning-templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTemplates, createTemplate } from '../learning-templates';
export const dynamic = "force-dynamic"; 

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const templates = await getTemplates(includeInactive);
    return NextResponse.json(templates);
  } catch (error: any) {
    console.error('Error in GET /api/learning-templates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const templateData = await request.json();
    const newTemplate = await createTemplate(templateData);
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/learning-templates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    );
  }
}