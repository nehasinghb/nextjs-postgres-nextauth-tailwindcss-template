// app/api/learning-templates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTemplateById, updateTemplate, deleteTemplate } from '../../learning-templates';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await getTemplateById(id);
    return NextResponse.json(template);
  } catch (error: any) {
    const { id } = await params;
    console.error(`Error in GET /api/learning-templates/${id}:`, error);
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

// app/api/learning-templates/[id]/route.ts - Updated PUT handler
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[ROUTE] PUT request received');
  console.log('[ROUTE] Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    console.log('[ROUTE] Awaiting params...');
    const { id } = await params;
    console.log('[ROUTE] Template ID:', id);
    
    // Check if body exists and is readable
    console.log('[ROUTE] Request method:', request.method);
    console.log('[ROUTE] Request URL:', request.url);
    console.log('[ROUTE] Content-Type:', request.headers.get('content-type'));
    console.log('[ROUTE] Content-Length:', request.headers.get('content-length'));
    
    // Try to read the body with a timeout
    console.log('[ROUTE] Attempting to parse request body...');
    
    let templateData;
    try {
      // Create a timeout promise
      const bodyPromise = request.json();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Body parsing timeout after 5 seconds')), 5000)
      );
      
      templateData = await Promise.race([bodyPromise, timeoutPromise]);
      console.log('[ROUTE] Body parsed successfully');
      console.log('[ROUTE] Template data keys:', Object.keys(templateData));
    } catch (bodyError: any) {
      console.error('[ROUTE] Failed to parse body:', bodyError.message);
      
      // Try to read as text instead
      try {
        const textBody = await request.text();
        console.log('[ROUTE] Raw body text:', textBody.substring(0, 200));
      } catch (textError) {
        console.error('[ROUTE] Failed to read as text:', textError);
      }
      
      throw new Error(`Failed to parse request body: ${bodyError.message}`);
    }
    
    console.log('[ROUTE] Calling updateTemplate...');
    
    // Call with timeout
    const updatePromise = updateTemplate(id, templateData);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Update timeout after 30 seconds')), 30000)
    );
    
    const updatedTemplate = await Promise.race([updatePromise, timeoutPromise]);
    console.log('[ROUTE] Update complete, sending response');
    
    return NextResponse.json(updatedTemplate);
  } catch (error: any) {
    console.error('[ROUTE] Error in PUT handler:', error);
    const { id } = await params;
    
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteTemplate(id);
    return NextResponse.json(result);
  } catch (error: any) {
    const { id } = await params;
    console.error(`Error in DELETE /api/learning-templates/${id}:`, error);
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