// app/api/learning-templates/bulk-upload/route.ts - UPDATED with Complexity & AI
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createTemplate } from '../../learning-templates';

export const dynamic = 'force-dynamic';

type TemplateCategory = 'reading' | 'problem-solving' | 'lecture';

interface BulkUploadMetric {
  name: string;
  description?: string;
  type: 'percentage' | 'time' | 'count' | 'rating' | 'text';
  defaultValue?: number | string;
  min?: number;
  max?: number;
}

interface BulkUploadPhase {
  title: string;
  description?: string;
  icon: string;
  color: string;
  backgroundColor: string;
  metrics: BulkUploadMetric[];
}

interface BulkUploadOption {
  name: string;
  description?: string;
  phases: BulkUploadPhase[];
}

// NEW: Complexity configuration types
interface ComplexityConfig {
  name: string;
  description: string;
  targetAccuracy: number;
  aiPrompt: string;
}

interface ComplexityLevels {
  easy?: ComplexityConfig;
  medium?: ComplexityConfig;
  hard?: ComplexityConfig;
}

// NEW: AI content generation config
interface AIContentGeneration {
  enabled: boolean;
  capabilities: string[];
  basePrompt: string;
}

interface BulkUploadTemplate {
  name: string;
  description: string;
  icon: string;
  isActive?: boolean;
  templateCategory?: TemplateCategory;
  complexityLevels?: ComplexityLevels; // NEW
  aiContentGeneration?: AIContentGeneration; // NEW
  options: BulkUploadOption[];
}

interface BulkUploadPayload {
  version?: string;
  templates: BulkUploadTemplate[];
}

interface UploadResult {
  success: boolean;
  templateName: string;
  templateId?: string;
  error?: string;
  detectedCategory?: TemplateCategory;
  hasComplexity?: boolean; // NEW
  hasAIGeneration?: boolean; // NEW
}

// Category detection (preserved from original)
function detectTemplateCategory(template: BulkUploadTemplate): TemplateCategory {
  if (template.templateCategory) {
    const validCategories: TemplateCategory[] = ['reading', 'problem-solving', 'lecture'];
    if (validCategories.includes(template.templateCategory)) {
      return template.templateCategory;
    }
  }
  
  const nameLower = template.name.toLowerCase();
  const descLower = template.description.toLowerCase();
  const iconLower = template.icon.toLowerCase();
  
  let readingScore = 0;
  let problemSolvingScore = 0;
  let lectureScore = 0;
  
  const readingKeywords = ['read', 'book', 'pdf', 'article', 'text', 'document', 'chapter', 'passage'];
  const problemKeywords = ['problem', 'solving', 'solve', 'exercise', 'question', 'practice', 'case', 'analyze', 'calculate', 'math'];
  const lectureKeywords = ['lecture', 'video', 'watch', 'viewing', 'presentation', 'lesson', 'tutorial', 'recording'];
  
  readingKeywords.forEach(keyword => {
    if (nameLower.includes(keyword)) readingScore += 2;
    if (descLower.includes(keyword)) readingScore += 1;
  });
  
  problemKeywords.forEach(keyword => {
    if (nameLower.includes(keyword)) problemSolvingScore += 2;
    if (descLower.includes(keyword)) problemSolvingScore += 1;
  });
  
  lectureKeywords.forEach(keyword => {
    if (nameLower.includes(keyword)) lectureScore += 2;
    if (descLower.includes(keyword)) lectureScore += 1;
  });
  
  const readingIcons = ['book', 'book-open', 'file-text', 'file-document', 'text'];
  const problemIcons = ['math', 'calculator', 'brain', 'puzzle', 'lightbulb'];
  const lectureIcons = ['video', 'play', 'monitor', 'presentation', 'youtube'];
  
  if (readingIcons.some(icon => iconLower.includes(icon))) readingScore += 3;
  if (problemIcons.some(icon => iconLower.includes(icon))) problemSolvingScore += 3;
  if (lectureIcons.some(icon => iconLower.includes(icon))) lectureScore += 3;
  
  const maxScore = Math.max(readingScore, problemSolvingScore, lectureScore);
  
  if (maxScore === 0) {
    console.log('[Bulk Upload] No clear category indicators, defaulting to reading for:', template.name);
    return 'reading';
  }
  
  if (problemSolvingScore === maxScore) return 'problem-solving';
  if (lectureScore === maxScore) return 'lecture';
  return 'reading';
}

// NEW: Default complexity levels if not provided
const DEFAULT_COMPLEXITY_LEVELS: ComplexityLevels = {
  easy: {
    name: 'Basic Review',
    description: 'Fundamental concepts and first-order questions',
    targetAccuracy: 75,
    aiPrompt: 'Generate basic content focusing on fundamental concepts and recall.'
  },
  medium: {
    name: 'Standard Review',
    description: 'Clinical application with 2-step reasoning',
    targetAccuracy: 65,
    aiPrompt: 'Generate intermediate content with clinical vignettes and application.'
  },
  hard: {
    name: 'Advanced Review',
    description: 'Complex integration and atypical cases',
    targetAccuracy: 55,
    aiPrompt: 'Generate advanced content with complex scenarios and edge cases.'
  }
};

// NEW: Default AI content generation if not provided
const DEFAULT_AI_CONTENT_GENERATION: AIContentGeneration = {
  enabled: true,
  capabilities: [
    'generate_summaries',
    'create_practice_questions',
    'identify_key_concepts'
  ],
  basePrompt: 'You are an educational expert helping students learn effectively.'
};

// UPDATED: Validate template with complexity and AI support
function validateTemplate(template: BulkUploadTemplate): string | null {
  if (!template.name || !template.name.trim()) {
    return 'Template name is required';
  }
  
  if (!template.description || !template.description.trim()) {
    return 'Template description is required';
  }
  
  if (!template.icon) {
    return 'Template icon is required';
  }
  
  if (template.templateCategory) {
    const validCategories: TemplateCategory[] = ['reading', 'problem-solving', 'lecture'];
    if (!validCategories.includes(template.templateCategory)) {
      return `Invalid template category "${template.templateCategory}". Must be one of: ${validCategories.join(', ')}`;
    }
  }
  
  // NEW: Validate complexity levels if provided
  if (template.complexityLevels) {
    const validLevels = ['easy', 'medium', 'hard'];
    for (const level of Object.keys(template.complexityLevels)) {
      if (!validLevels.includes(level)) {
        return `Invalid complexity level "${level}". Must be one of: ${validLevels.join(', ')}`;
      }
      
      const config = template.complexityLevels[level as keyof ComplexityLevels];
      if (!config) continue;
      
      if (!config.name || !config.description || !config.aiPrompt) {
        return `Complexity level "${level}" must have name, description, and aiPrompt`;
      }
      
      if (typeof config.targetAccuracy !== 'number' || config.targetAccuracy < 0 || config.targetAccuracy > 100) {
        return `Complexity level "${level}" targetAccuracy must be a number between 0 and 100`;
      }
    }
  }
  
  // NEW: Validate AI content generation if provided
  if (template.aiContentGeneration) {
    const ai = template.aiContentGeneration;
    
    if (typeof ai.enabled !== 'boolean') {
      return 'AI content generation "enabled" must be a boolean';
    }
    
    if (!Array.isArray(ai.capabilities)) {
      return 'AI content generation "capabilities" must be an array';
    }
    
    if (!ai.basePrompt || typeof ai.basePrompt !== 'string') {
      return 'AI content generation "basePrompt" is required and must be a string';
    }
  }
  
  if (!template.options || template.options.length === 0) {
    return 'Template must have at least one option';
  }
  
  // Validate each option (preserved from original)
  for (let i = 0; i < template.options.length; i++) {
    const option = template.options[i];
    
    if (!option.name || !option.name.trim()) {
      return `Option ${i + 1}: name is required`;
    }
    
    if (!option.phases || option.phases.length === 0) {
      return `Option "${option.name}": must have at least one phase`;
    }
    
    for (let j = 0; j < option.phases.length; j++) {
      const phase = option.phases[j];
      
      if (!phase.title || !phase.title.trim()) {
        return `Option "${option.name}", Phase ${j + 1}: title is required`;
      }
      
      if (!phase.icon) {
        return `Phase "${phase.title}": icon is required`;
      }
      
      if (!phase.color) {
        return `Phase "${phase.title}": color is required`;
      }
      
      if (!phase.backgroundColor) {
        return `Phase "${phase.title}": backgroundColor is required`;
      }
      
      if (!phase.metrics || phase.metrics.length === 0) {
        return `Phase "${phase.title}": must have at least one metric`;
      }
      
      for (let k = 0; k < phase.metrics.length; k++) {
        const metric = phase.metrics[k];
        
        if (!metric.name || !metric.name.trim()) {
          return `Phase "${phase.title}", Metric ${k + 1}: name is required`;
        }
        
        if (!metric.type) {
          return `Metric "${metric.name}": type is required`;
        }
        
        const validTypes = ['percentage', 'time', 'count', 'rating', 'text'];
        if (!validTypes.includes(metric.type)) {
          return `Metric "${metric.name}": invalid type "${metric.type}"`;
        }
        
        if ((metric.type === 'percentage' || metric.type === 'rating')) {
          if (metric.min !== undefined && metric.max !== undefined) {
            if (metric.min >= metric.max) {
              return `Metric "${metric.name}": min must be less than max`;
            }
          }
        }
      }
    }
  }
  
  return null;
}

// POST - Bulk upload templates from JSON file
export async function POST(request: NextRequest) {
  try {
    console.log('[Bulk Upload API] POST request received');
    
    const session = await auth();
    if (!session || !session.user) {
      console.log('[Bulk Upload API] No session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log('[Bulk Upload API] User ID:', userId);
    
    let payload: BulkUploadPayload;
    try {
      payload = await request.json();
    } catch (error) {
      console.error('[Bulk Upload API] Failed to parse JSON:', error);
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }
    
    if (!payload.templates || !Array.isArray(payload.templates)) {
      return NextResponse.json(
        { error: 'Invalid payload: "templates" array is required' },
        { status: 400 }
      );
    }
    
    if (payload.templates.length === 0) {
      return NextResponse.json(
        { error: 'No templates provided' },
        { status: 400 }
      );
    }
    
    console.log(`[Bulk Upload API] Processing ${payload.templates.length} templates`);
    
    const results: UploadResult[] = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < payload.templates.length; i++) {
      const template = payload.templates[i];
      console.log(`[Bulk Upload API] Processing template ${i + 1}/${payload.templates.length}: "${template.name}"`);
      
      const validationError = validateTemplate(template);
      if (validationError) {
        console.error(`[Bulk Upload API] Validation error for "${template.name}":`, validationError);
        results.push({
          success: false,
          templateName: template.name || `Template ${i + 1}`,
          error: validationError
        });
        errorCount++;
        continue;
      }
      
      const detectedCategory = detectTemplateCategory(template);
      
      // NEW: Use provided complexity levels or defaults
      const complexityLevels = template.complexityLevels || DEFAULT_COMPLEXITY_LEVELS;
      
      // NEW: Use provided AI config or defaults
      const aiContentGeneration = template.aiContentGeneration || DEFAULT_AI_CONTENT_GENERATION;
      
      const templateWithAll = {
        ...template,
        templateCategory: detectedCategory,
        complexityLevels, // NEW
        aiContentGeneration // NEW
      };
      
      console.log(`[Bulk Upload API] Template "${template.name}" configuration:`, {
        category: detectedCategory,
        hasComplexity: !!template.complexityLevels,
        hasAI: !!template.aiContentGeneration
      });
      
      try {
        const createdTemplate = await createTemplate(templateWithAll);
        console.log(`[Bulk Upload API] Successfully created template "${template.name}" with ID: ${createdTemplate.id}`);
        
        results.push({
          success: true,
          templateName: template.name,
          templateId: createdTemplate.id,
          detectedCategory: detectedCategory,
          hasComplexity: !!template.complexityLevels, // NEW
          hasAIGeneration: !!template.aiContentGeneration // NEW
        });
        successCount++;
      } catch (error: any) {
        console.error(`[Bulk Upload API] Error creating template "${template.name}":`, error);
        results.push({
          success: false,
          templateName: template.name,
          error: error.message || 'Failed to create template'
        });
        errorCount++;
      }
    }
    
    console.log(`[Bulk Upload API] Completed: ${successCount} succeeded, ${errorCount} failed`);
    
    return NextResponse.json({
      message: `Processed ${payload.templates.length} templates`,
      summary: {
        total: payload.templates.length,
        successful: successCount,
        failed: errorCount
      },
      results
    }, { status: successCount > 0 ? 200 : 400 });
    
  } catch (error: any) {
    console.error('[Bulk Upload API] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process bulk upload' },
      { status: 500 }
    );
  }
}