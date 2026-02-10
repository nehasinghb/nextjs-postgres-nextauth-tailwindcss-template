// app/api/learning-templates.ts - UPDATED: AI at phase level
import { db, query } from '@/lib/db';
import { auth } from '@/lib/auth';

export type TemplateCategory = 'reading' | 'problem-solving' | 'lecture';
export type ComplexityLevel = 'easy' | 'medium' | 'hard';

// Complexity configuration types (TEMPLATE LEVEL)
export interface ComplexityConfig {
  name: string;
  description: string;
  targetAccuracy: number;
  aiPrompt: string;
}

export interface ComplexityLevels {
  easy: ComplexityConfig;
  medium: ComplexityConfig;
  hard: ComplexityConfig;
}

// AI content generation types (PHASE LEVEL)
export interface AIContentGeneration {
  enabled: boolean;
  capabilities: string[];
  basePrompt: string;
}

// Database types
export interface LearningTemplate {
  template_id: string;
  name: string;
  description: string;
  icon: string;
  is_default: boolean;
  is_active: boolean;
  created_by: string | null;
  template_category: TemplateCategory;
  complexity_levels?: ComplexityLevels | null;
  created_at: Date;
  updated_at: Date;
  options?: LearningOption[];
}

export interface LearningOption {
  option_id: string;
  template_id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  phases?: LearningPhase[];
}

export interface LearningPhase {
  phase_id: string;
  option_id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  background_color: string;
  sequence_number: number;
  ai_content_generation?: AIContentGeneration | null; // AI AT PHASE LEVEL
  created_at: Date;
  updated_at: Date;
  metrics?: PhaseMetric[];
}

export interface PhaseMetric {
  metric_id: string;
  phase_id: string;
  name: string;
  description: string | null;
  metric_type: 'percentage' | 'time' | 'count' | 'rating' | 'text';
  default_value: string | null;
  min_value: number | null;
  max_value: number | null;
  sequence_number: number;
  created_at: Date;
  updated_at: Date;
}

// Default configurations
export const DEFAULT_COMPLEXITY_LEVELS: ComplexityLevels = {
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

export const DEFAULT_AI_CONTENT_GENERATION: AIContentGeneration = {
  enabled: true,
  capabilities: [
    'generate_summaries',
    'create_practice_questions',
    'identify_key_concepts'
  ],
  basePrompt: 'You are an educational expert helping students learn effectively.'
};

// Helper function to detect category
function detectCategoryFromTemplate(templateData: any): TemplateCategory {
  if (templateData.templateCategory) {
    const validCategories: TemplateCategory[] = ['reading', 'problem-solving', 'lecture'];
    if (validCategories.includes(templateData.templateCategory)) {
      return templateData.templateCategory;
    }
  }
  
  const nameLower = (templateData.name || '').toLowerCase();
  const descLower = (templateData.description || '').toLowerCase();
  const iconLower = (templateData.icon || '').toLowerCase();
  
  const problemKeywords = ['problem', 'solving', 'solve', 'exercise', 'question', 'practice', 'case', 'math', 'calculate'];
  if (problemKeywords.some(keyword => nameLower.includes(keyword) || descLower.includes(keyword))) {
    return 'problem-solving';
  }
  
  const lectureKeywords = ['lecture', 'video', 'watch', 'viewing', 'presentation', 'lesson', 'tutorial'];
  if (lectureKeywords.some(keyword => nameLower.includes(keyword) || descLower.includes(keyword))) {
    return 'lecture';
  }
  
  if (iconLower.includes('math') || iconLower.includes('calculator')) {
    return 'problem-solving';
  }
  if (iconLower.includes('video') || iconLower.includes('play')) {
    return 'lecture';
  }
  if (iconLower.includes('book') || iconLower.includes('read')) {
    return 'reading';
  }
  
  return 'reading';
}

// Helper functions to convert between database and UI models
export function toUITemplate(template: LearningTemplate): any {
  console.log('[toUITemplate] Converting:', template.name);
  
  let complexityLevels = template.complexity_levels;
  if (typeof complexityLevels === 'string') {
    try {
      complexityLevels = JSON.parse(complexityLevels);
    } catch (e) {
      console.error('[toUITemplate] Parse error complexity:', e);
      complexityLevels = null;
    }
  }
  
  const result = {
    id: template.template_id,
    name: template.name,
    description: template.description,
    icon: template.icon,
    isDefault: template.is_default,
    isActive: template.is_active,
    createdBy: template.created_by,
    templateCategory: template.template_category,
    complexityLevels: complexityLevels,
    options: template.options?.map(toUIOption) || []
  };
  
  return result;
}

export function toUIOption(option: LearningOption): any {
  return {
    id: option.option_id,
    name: option.name,
    description: option.description || '',
    phases: option.phases?.map(toUIPhase) || []
  };
}

export function toUIPhase(phase: LearningPhase): any {
  // Parse AI config if it's a string
  let aiContentGeneration = phase.ai_content_generation;
  if (typeof aiContentGeneration === 'string') {
    try {
      aiContentGeneration = JSON.parse(aiContentGeneration);
    } catch (e) {
      console.error('[toUIPhase] Parse error AI:', e);
      aiContentGeneration = null;
    }
  }
  
  return {
    id: phase.phase_id,
    title: phase.title,
    description: phase.description || '',
    icon: phase.icon,
    color: phase.color,
    backgroundColor: phase.background_color,
    aiContentGeneration: aiContentGeneration, // AI AT PHASE LEVEL
    metrics: phase.metrics?.map(toUIMetric) || []
  };
}

export function toUIMetric(metric: PhaseMetric): any {
  return {
    id: metric.metric_id,
    name: metric.name,
    description: metric.description || '',
    type: metric.metric_type,
    defaultValue:
      metric.default_value !== null
        ? metric.metric_type === 'percentage' ||
          metric.metric_type === 'count' ||
          metric.metric_type === 'rating'
          ? Number(metric.default_value)
          : metric.default_value
        : undefined,
    min: metric.min_value,
    max: metric.max_value
  };
}

// API FUNCTIONS

export async function getTemplates(includeInactive = false) {
  try {
    const result = await query(`
      SELECT * FROM learning_templates
      ${!includeInactive ? 'WHERE is_active = true' : ''}
      ORDER BY is_default DESC, name ASC
    `);
    
    const templates = result.rows;

    const templatesWithOptions = await Promise.all(
      templates.map(async (template: LearningTemplate) => {
        const options = await getOptionsByTemplateId(template.template_id);
        return { ...template, options };
      })
    );

    return templatesWithOptions.map(toUITemplate);
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw new Error('Failed to fetch learning templates');
  }
}

export async function getOptionsByTemplateId(templateId: string) {
  try {
    const result = await query(
      `SELECT * FROM learning_options
       WHERE template_id = $1
       ORDER BY name ASC`,
      [templateId]
    );

    const options = result.rows;

    const optionsWithPhases = await Promise.all(
      options.map(async (option: LearningOption) => {
        const phases = await getPhasesByOptionId(option.option_id);
        return { ...option, phases };
      })
    );

    return optionsWithPhases;
  } catch (error) {
    console.error(`Error fetching options for template ${templateId}:`, error);
    throw new Error('Failed to fetch learning options');
  }
}

export async function getPhasesByOptionId(optionId: string) {
  try {
    const result = await query(
      `SELECT * FROM learning_phases
       WHERE option_id = $1
       ORDER BY sequence_number ASC`,
      [optionId]
    );

    const phases = result.rows;

    const phasesWithMetrics = await Promise.all(
      phases.map(async (phase: LearningPhase) => {
        const metrics = await getMetricsByPhaseId(phase.phase_id);
        return { ...phase, metrics };
      })
    );

    return phasesWithMetrics;
  } catch (error) {
    console.error(`Error fetching phases for option ${optionId}:`, error);
    throw new Error('Failed to fetch learning phases');
  }
}

export async function getMetricsByPhaseId(phaseId: string) {
  try {
    const result = await query(
      `SELECT * FROM phase_metrics
       WHERE phase_id = $1
       ORDER BY sequence_number ASC`,
      [phaseId]
    );

    return result.rows;
  } catch (error) {
    console.error(`Error fetching metrics for phase ${phaseId}:`, error);
    throw new Error('Failed to fetch phase metrics');
  }
}

export async function getTemplateById(templateId: string) {
  try {
    const result = await query(
      `SELECT * FROM learning_templates WHERE template_id = $1`,
      [templateId]
    );

    const template = result.rows[0];

    if (!template) {
      throw new Error('Template not found');
    }

    const options = await getOptionsByTemplateId(templateId);
    template.options = options;

    return toUITemplate(template);
  } catch (error) {
    console.error(`Error fetching template ${templateId}:`, error);
    throw new Error('Failed to fetch learning template');
  }
}

export async function createTemplate(templateData: any) {
  try {
    console.log('[createTemplate] Starting template creation');
    
    const session = await auth();
    if (!session || !session.user) {
      throw new Error('Authentication required');
    }

    let templateCategory = templateData.templateCategory;
    
    if (!templateCategory) {
      templateCategory = detectCategoryFromTemplate(templateData);
      console.log('[createTemplate] Auto-detected category:', templateCategory);
    }
    
    const validCategories: TemplateCategory[] = ['reading', 'problem-solving', 'lecture'];
    if (!validCategories.includes(templateCategory)) {
      throw new Error(`Invalid template category: ${templateCategory}`);
    }

    const complexityLevels = templateData.complexityLevels || DEFAULT_COMPLEXITY_LEVELS;

    // Insert the template (NO AI config here)
    const newTemplateResult = await query(`
      INSERT INTO learning_templates
        (name, description, icon, is_default, is_active, template_category, complexity_levels)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
      RETURNING *
    `, [
      templateData.name,
      templateData.description,
      templateData.icon,
      false,
      templateData.isActive !== undefined ? templateData.isActive : true,
      templateCategory,
      JSON.stringify(complexityLevels)
    ]);
    
    const newTemplate = newTemplateResult.rows[0];
    console.log('[createTemplate] Template created');

    // Create options with their phases
    if (templateData.options && templateData.options.length > 0) {
      await Promise.all(
        templateData.options.map(async (option: any) => {
          await createOption({
            ...option,
            templateId: newTemplate.template_id
          });
        })
      );
    }

    return await getTemplateById(newTemplate.template_id);
  } catch (error) {
    console.error('[createTemplate] Error:', error);
    throw new Error('Failed to create learning template');
  }
}

export async function createOption(optionData: any) {
  try {
    const newOptionResult = await query(
      `INSERT INTO learning_options (template_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        optionData.templateId,
        optionData.name,
        optionData.description || null
      ]
    );

    const newOption = newOptionResult.rows[0];

    if (optionData.phases && optionData.phases.length > 0) {
      await Promise.all(
        optionData.phases.map(async (phase: any, index: number) => {
          await createPhase({
            ...phase,
            optionId: newOption.option_id,
            sequenceNumber: phase.sequenceNumber || index + 1
          });
        })
      );
    }

    return newOption;
  } catch (error) {
    console.error('Error creating option:', error);
    throw new Error('Failed to create learning option');
  }
}

export async function updateOption(optionId: string, optionData: any) {
  try {
    await query(
      `UPDATE learning_options
       SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
       WHERE option_id = $3`,
      [
        optionData.name, 
        optionData.description || null,
        optionId
      ]
    );

    // Handle phases
    if (optionData.phases) {
      const existingPhasesResult = await query(
        `SELECT phase_id FROM learning_phases WHERE option_id = $1`,
        [optionId]
      );

      const existingPhases = existingPhasesResult.rows;
      const existingPhaseIds = existingPhases.map((p: any) => p.phase_id);
      const newPhaseIds = optionData.phases
        .filter((p: any) => p.id)
        .map((p: any) => p.id);

      const phasesToDelete = existingPhaseIds.filter(
        (id: string) => !newPhaseIds.includes(id)
      );

      if (phasesToDelete.length > 0) {
        await Promise.all(
          phasesToDelete.map(async (phaseId: string) => {
            await query(
              `DELETE FROM learning_phases WHERE phase_id = $1`,
              [phaseId]
            );
          })
        );
      }

      await Promise.all(
        optionData.phases.map(async (phase: any, index: number) => {
          if (phase.id && existingPhaseIds.includes(phase.id)) {
            await updatePhase(phase.id, {
              ...phase,
              sequenceNumber: phase.sequenceNumber || index + 1
            });
          } else {
            await createPhase({
              ...phase,
              optionId,
              sequenceNumber: phase.sequenceNumber || index + 1
            });
          }
        })
      );
    }

    const optionResult = await query(
      `SELECT * FROM learning_options WHERE option_id = $1`,
      [optionId]
    );

    const option = optionResult.rows[0];
    const phases = await getPhasesByOptionId(optionId);
    option.phases = phases;

    return option;
  } catch (error) {
    console.error(`Error updating option ${optionId}:`, error);
    throw new Error('Failed to update learning option');
  }
}

export async function createPhase(phaseData: any) {
  try {
    // Handle AI config at phase level
    const aiConfig = phaseData.aiContentGeneration || null;
    
    const newPhaseResult = await query(
      `INSERT INTO learning_phases (
        option_id, title, description, icon, color, background_color, sequence_number, ai_content_generation
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
      RETURNING *`,
      [
        phaseData.optionId,
        phaseData.title,
        phaseData.description || null,
        phaseData.icon,
        phaseData.color,
        phaseData.backgroundColor,
        phaseData.sequenceNumber,
        aiConfig ? JSON.stringify(aiConfig) : null
      ]
    );

    const newPhase = newPhaseResult.rows[0];

    if (phaseData.metrics && phaseData.metrics.length > 0) {
      await Promise.all(
        phaseData.metrics.map(async (metric: any, index: number) => {
          await createMetric({
            ...metric,
            phaseId: newPhase.phase_id,
            sequenceNumber: metric.sequenceNumber || index + 1
          });
        })
      );
    }

    return newPhase;
  } catch (error) {
    console.error('Error creating phase:', error);
    throw new Error('Failed to create learning phase');
  }
}

export async function updatePhase(phaseId: string, phaseData: any) {
  try {
    const aiConfig = phaseData.aiContentGeneration || null;
    
    await query(
      `UPDATE learning_phases
       SET title = $1, description = $2, icon = $3, color = $4, 
           background_color = $5, sequence_number = $6, ai_content_generation = $7::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE phase_id = $8`,
      [
        phaseData.title,
        phaseData.description || null,
        phaseData.icon,
        phaseData.color,
        phaseData.backgroundColor,
        phaseData.sequenceNumber,
        aiConfig ? JSON.stringify(aiConfig) : null,
        phaseId
      ]
    );

    if (phaseData.metrics) {
      const existingMetricsResult = await query(
        `SELECT metric_id FROM phase_metrics WHERE phase_id = $1`,
        [phaseId]
      );

      const existingMetrics = existingMetricsResult.rows;
      const existingMetricIds = existingMetrics.map((m: any) => m.metric_id);
      const newMetricIds = phaseData.metrics
        .filter((m: any) => m.id)
        .map((m: any) => m.id);

      const metricsToDelete = existingMetricIds.filter(
        (id: string) => !newMetricIds.includes(id)
      );
      
      if (metricsToDelete.length > 0) {
        await Promise.all(
          metricsToDelete.map(async (metricId: string) => {
            await query(
              `DELETE FROM phase_metrics WHERE metric_id = $1`,
              [metricId]
            );
          })
        );
      }

      await Promise.all(
        phaseData.metrics.map(async (metric: any, index: number) => {
          if (metric.id && existingMetricIds.includes(metric.id)) {
            await updateMetric(metric.id, {
              ...metric,
              sequenceNumber: metric.sequenceNumber || index + 1
            });
          } else {
            await createMetric({
              ...metric,
              phaseId,
              sequenceNumber: metric.sequenceNumber || index + 1
            });
          }
        })
      );
    }

    const phaseResult = await query(
      `SELECT * FROM learning_phases WHERE phase_id = $1`,
      [phaseId]
    );

    const phase = phaseResult.rows[0];
    const metrics = await getMetricsByPhaseId(phaseId);
    phase.metrics = metrics;

    return phase;
  } catch (error) {
    console.error(`Error updating phase ${phaseId}:`, error);
    throw new Error('Failed to update learning phase');
  }
}

export async function createMetric(metricData: any) {
  try {
    let defaultValue = metricData.defaultValue;
    if (defaultValue !== undefined && defaultValue !== null) {
      defaultValue = defaultValue.toString();
    }

    const newMetricResult = await query(
      `INSERT INTO phase_metrics (
        phase_id, name, description, metric_type, default_value,
        min_value, max_value, sequence_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        metricData.phaseId,
        metricData.name,
        metricData.description || null,
        metricData.type,
        defaultValue,
        metricData.min || null,
        metricData.max || null,
        metricData.sequenceNumber
      ]
    );

    return newMetricResult.rows[0];
  } catch (error) {
    console.error('Error creating metric:', error);
    throw new Error('Failed to create phase metric');
  }
}

export async function updateMetric(metricId: string, metricData: any) {
  try {
    let defaultValue = metricData.defaultValue;
    if (defaultValue !== undefined && defaultValue !== null) {
      defaultValue = defaultValue.toString();
    }

    await query(
      `UPDATE phase_metrics
       SET name = $1, description = $2, metric_type = $3, default_value = $4,
           min_value = $5, max_value = $6, sequence_number = $7, updated_at = CURRENT_TIMESTAMP
       WHERE metric_id = $8`,
      [
        metricData.name,
        metricData.description || null,
        metricData.type,
        defaultValue,
        metricData.min || null,
        metricData.max || null,
        metricData.sequenceNumber,
        metricId
      ]
    );

    const metricResult = await query(
      `SELECT * FROM phase_metrics WHERE metric_id = $1`,
      [metricId]
    );

    return metricResult.rows[0];
  } catch (error) {
    console.error(`Error updating metric ${metricId}:`, error);
    throw new Error('Failed to update phase metric');
  }
}

export async function updateTemplate(templateId: string, templateData: any) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error('Authentication required');
    }

    let complexityLevels = templateData.complexityLevels;
    if (complexityLevels && typeof complexityLevels === 'object') {
      complexityLevels = JSON.stringify(complexityLevels);
    }

    await query(
      `UPDATE learning_templates
       SET name = $1, description = $2, icon = $3, is_active = $4, 
           template_category = $5, complexity_levels = $6::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE template_id = $7`,
      [
        templateData.name,
        templateData.description,
        templateData.icon,
        templateData.isActive,
        templateData.templateCategory,
        complexityLevels,
        templateId
      ]
    );

    if (templateData.options) {
      const existingOptionsResult = await query(
        `SELECT option_id FROM learning_options WHERE template_id = $1`,
        [templateId]
      );

      const existingOptions = existingOptionsResult.rows;
      const existingOptionIds = existingOptions.map((o: any) => o.option_id);
      const newOptionIds = templateData.options
        .filter((o: any) => o.id)
        .map((o: any) => o.id);

      const optionsToDelete = existingOptionIds.filter(
        (id: string) => !newOptionIds.includes(id)
      );

      if (optionsToDelete.length > 0) {
        await Promise.all(
          optionsToDelete.map(async (optionId: string) => {
            await query(
              `DELETE FROM learning_options WHERE option_id = $1`,
              [optionId]
            );
          })
        );
      }

      await Promise.all(
        templateData.options.map(async (option: any) => {
          if (option.id && existingOptionIds.includes(option.id)) {
            await updateOption(option.id, option);
          } else {
            await createOption({
              ...option,
              templateId
            });
          }
        })
      );
    }

    return await getTemplateById(templateId);
  } catch (error) {
    console.error(`Error updating template ${templateId}:`, error);
    throw new Error('Failed to update learning template');
  }
}

export async function deleteTemplate(templateId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error('Authentication required');
    }

    const templateResult = await query(
      `SELECT * FROM learning_templates WHERE template_id = $1`,
      [templateId]
    );

    const template = templateResult.rows[0];
    if (!template) {
      throw new Error('Template not found');
    }

    if (template.is_default) {
      throw new Error('Default templates cannot be deleted');
    }

    await query(
      `DELETE FROM learning_templates WHERE template_id = $1`,
      [templateId]
    );

    return { success: true };
  } catch (error) {
    console.error(`Error deleting template ${templateId}:`, error);
    throw new Error('Failed to delete learning template');
  }
}

function isAdmin(session: any): boolean {
  return session?.user?.email === 'admin@example.com';
}

export default {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getOptionsByTemplateId,
  createOption,
  updateOption,
  getPhasesByOptionId,
  createPhase,
  updatePhase,
  getMetricsByPhaseId,
  createMetric,
  updateMetric
};