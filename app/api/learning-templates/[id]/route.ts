// app/api/learning-templates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTemplateById, updateTemplate, deleteTemplate } from '../../learning-templates';
export const dynamic = 'force-dynamic';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await getTemplateById(params.id);
    return NextResponse.json(template);
  } catch (error: any) {
    console.error(`Error in GET /api/learning-templates/${params.id}:`, error);
    if (error.message === 'Template not found') {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateData = await request.json();
    const updatedTemplate = await updateTemplate(params.id, templateData);
    return NextResponse.json(updatedTemplate);
  } catch (error: any) {
    console.error(`Error in PUT /api/learning-templates/${params.id}:`, error);
    if (error.message === 'Template not found') {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    if (error.message.includes('Not authorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteTemplate(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error in DELETE /api/learning-templates/${params.id}:`, error);
    if (error.message === 'Template not found') {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    if (error.message.includes('Not authorized') || error.message.includes('cannot be deleted')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    );
  }
}