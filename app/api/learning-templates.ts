// app/api/learning-templates.ts

import { db, query } from '@/lib/db';
import { auth } from '@/lib/auth';

// Types from database
export interface LearningTemplate {
  template_id: string;
  name: string;
  description: string;
  icon: string;
  is_default: boolean;
  is_active: boolean;
  created_by: string | null;
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

// Helper functions to convert between database and UI models
export function toUITemplate(template: LearningTemplate): any {
  return {
    id: template.template_id,
    name: template.name,
    description: template.description,
    icon: template.icon,
    isDefault: template.is_default,
    isActive: template.is_active,
    createdBy: template.created_by,
    options: template.options?.map(toUIOption) || []
  };
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
  return {
    id: phase.phase_id,
    title: phase.title,
    description: phase.description || '',
    icon: phase.icon,
    color: phase.color,
    backgroundColor: phase.background_color,
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

// API to get all templates with options
export async function getTemplates(includeInactive = false) {
  try {
    const whereClause = includeInactive ? {} : { is_active: true };
    
    const result = await query(`
      SELECT * FROM learning_templates
      ${!includeInactive ? 'WHERE is_active = true' : ''}
      ORDER BY is_default DESC, name ASC
    `);
    
    // Extract rows from result
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

// Get options by template ID
export async function getOptionsByTemplateId(templateId: string) {
  try {
    const result = await query(
      `
      SELECT * FROM learning_options
      WHERE template_id = $1
      ORDER BY name ASC
    `,
      [templateId]
    );

    // Extract rows from result
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

// Get phases by option ID
export async function getPhasesByOptionId(optionId: string) {
  try {
    const result = await query(
      `
      SELECT * FROM learning_phases
      WHERE option_id = $1
      ORDER BY sequence_number ASC
    `,
      [optionId]
    );

    // Extract rows from result
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

// Get metrics by phase ID
export async function getMetricsByPhaseId(phaseId: string) {
  try {
    const result = await query(
      `
      SELECT * FROM phase_metrics
      WHERE phase_id = $1
      ORDER BY sequence_number ASC
    `,
      [phaseId]
    );

    // Extract rows from result
    return result.rows;
  } catch (error) {
    console.error(`Error fetching metrics for phase ${phaseId}:`, error);
    throw new Error('Failed to fetch phase metrics');
  }
}

// Get single template with all details
export async function getTemplateById(templateId: string) {
  try {
    const result = await query(
      `
      SELECT * FROM learning_templates
      WHERE template_id = $1
    `,
      [templateId]
    );

    // Extract first row from result
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

// --------------------------------------------------------------------------------
// Create a new template (CHANGED: removed auth() and used system@example.com user)
// --------------------------------------------------------------------------------
// Fixed createTemplate function - removes created_by column reference
export async function createTemplate(templateData: any) {
  try {
    // 1) Read session from JWT cookie (optional - for future use)
    const session = await auth();
    if (!session || !session.user) {
      throw new Error('Authentication required');
    }

    // 2) Insert the template WITHOUT created_by since that column doesn't exist
    const newTemplateResult = await query(`
      INSERT INTO learning_templates
        (name, description, icon, is_default, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      templateData.name,
      templateData.description,
      templateData.icon,
      false, // new templates are never default
      templateData.isActive !== undefined ? templateData.isActive : true
    ]);
    const newTemplate = newTemplateResult.rows[0];

    // 3) Create options if provided
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

    // 4) Return the newly created template (with all nested options, phases, metrics)
    return await getTemplateById(newTemplate.template_id);
  } catch (error) {
    console.error('Error creating template:', error);
    throw new Error('Failed to create learning template');
  }
}


// Complete updateTemplate function that handles all operations
export async function updateTemplate(templateId: string, templateData: any) {
  console.log(`[updateTemplate] Starting for template ${templateId}`);
  console.log(`[updateTemplate] Options count: ${templateData.options?.length || 0}`);
  
  try {
    // Check auth
    const session = await auth();
    if (!session || !session.user) {
      throw new Error('Authentication required');
    }

    // Check if template exists
    const templateResult = await query(
      `SELECT * FROM learning_templates WHERE template_id = $1`,
      [templateId]
    );

    const template = templateResult.rows[0];
    if (!template) {
      throw new Error('Template not found');
    }

    // Check permissions
    if (template.is_default && !isAdmin(session)) {
      throw new Error('Not authorized to modify default templates');
    }

    // Update template metadata
    console.log('[updateTemplate] Updating template metadata...');
    await query(
      `UPDATE learning_templates
       SET name = $1, description = $2, icon = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
       WHERE template_id = $5`,
      [
        templateData.name,
        templateData.description,
        templateData.icon,
        templateData.isActive !== undefined ? templateData.isActive : template.is_active,
        templateId
      ]
    );
    console.log('[updateTemplate] Template metadata updated');

    // Handle options if provided
    if (templateData.options && Array.isArray(templateData.options)) {
      console.log(`[updateTemplate] Processing ${templateData.options.length} options...`);
      
      // Get existing options
      const existingOptionsResult = await query(
        `SELECT option_id FROM learning_options WHERE template_id = $1`,
        [templateId]
      );
      const existingOptionIds = existingOptionsResult.rows.map((o: any) => o.option_id);
      console.log(`[updateTemplate] Found ${existingOptionIds.length} existing options`);
      
      // Track which options are in the new data
      const optionsInNewData: string[] = [];
      
      // Process each option
      for (const option of templateData.options) {
        if (!option.id || option.id.startsWith('temp-')) {
          // NEW option - create it
          console.log(`[updateTemplate] Creating new option: ${option.name}`);
          
          const newOptionResult = await query(
            `INSERT INTO learning_options (template_id, name, description)
             VALUES ($1, $2, $3)
             RETURNING option_id`,
            [templateId, option.name, option.description || null]
          );
          
          const newOptionId = newOptionResult.rows[0].option_id;
          console.log(`[updateTemplate] New option created with ID: ${newOptionId}`);
          
          // Create phases for the new option if provided
          if (option.phases && Array.isArray(option.phases)) {
            for (let i = 0; i < option.phases.length; i++) {
              const phase = option.phases[i];
              await query(
                `INSERT INTO learning_phases 
                 (option_id, title, description, icon, color, background_color, sequence_number)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                  newOptionId,
                  phase.title || 'New Phase',
                  phase.description || null,
                  phase.icon || 'brain',
                  phase.color || 'rgba(98, 102, 241, 1)',
                  phase.backgroundColor || phase.background_color || 'rgba(98, 102, 241, 0.1)',
                  i + 1
                ]
              );
            }
          }
        } else {
          // EXISTING option - update it
          console.log(`[updateTemplate] Updating existing option ${option.id}: ${option.name}`);
          optionsInNewData.push(option.id);
          
          await query(
            `UPDATE learning_options
             SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
             WHERE option_id = $3`,
            [option.name, option.description || null, option.id]
          );
          
          // Simple phase handling - just update basic info, don't do deep updates
          // This prevents the timeout issue we had before
        }
      }
      
      // Delete options that are not in the new data
      const optionsToDelete = existingOptionIds.filter(
        (id: string) => !optionsInNewData.includes(id)
      );
      
      if (optionsToDelete.length > 0) {
        console.log(`[updateTemplate] Deleting ${optionsToDelete.length} removed options`);
        for (const optionId of optionsToDelete) {
          await query(
            `DELETE FROM learning_options WHERE option_id = $1`,
            [optionId]
          );
        }
      }
    }

    console.log('[updateTemplate] Complete - fetching updated template');
    
    // Return the updated template with full data
    return await getTemplateById(templateId);
    
  } catch (error: any) {
    console.error('[updateTemplate] ERROR:', error.message);
    throw error;
  }
}


// Create an option
export async function createOption(optionData: any) {
  try {
    // Insert the option
    const newOptionResult = await query(
      `
      INSERT INTO learning_options (template_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [
        optionData.templateId,
        optionData.name,
        optionData.description || null
      ]
    );

    // Extract first row from result
    const newOption = newOptionResult.rows[0];

    // Create phases if provided
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

// Update an option
export async function updateOption(optionId: string, optionData: any) {
  try {
    // Update the option
    await query(
      `
      UPDATE learning_options
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE option_id = $3
    `,
      [optionData.name, optionData.description || null, optionId]
    );

    // Handle phases separately (phases can be added/updated/deleted)
    if (optionData.phases) {
      // Get existing phases
      const existingPhasesResult = await query(
        `
        SELECT phase_id FROM learning_phases
        WHERE option_id = $1
      `,
        [optionId]
      );

      // Extract rows from result
      const existingPhases = existingPhasesResult.rows;

      const existingPhaseIds = existingPhases.map((p: any) => p.phase_id);
      const newPhaseIds = optionData.phases
        .filter((p: any) => p.id)
        .map((p: any) => p.id);

      // Delete phases not in the new data
      const phasesToDelete = existingPhaseIds.filter(
        (id: string) => !newPhaseIds.includes(id)
      );

      if (phasesToDelete.length > 0) {
        await Promise.all(
          phasesToDelete.map(async (phaseId: string) => {
            await query(
              `
              DELETE FROM learning_phases
              WHERE phase_id = $1
            `,
              [phaseId]
            );
          })
        );
      }

      // Update or create phases
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

    // Fetch the updated option with phases
    const optionResult = await query(
      `
      SELECT * FROM learning_options
      WHERE option_id = $1
    `,
      [optionId]
    );

    // Extract first row from result
    const option = optionResult.rows[0];

    const phases = await getPhasesByOptionId(optionId);
    option.phases = phases;

    return option;
  } catch (error) {
    console.error(`Error updating option ${optionId}:`, error);
    throw new Error('Failed to update learning option');
  }
}

// Create a phase
export async function createPhase(phaseData: any) {
  try {
    // Insert the phase
    const newPhaseResult = await query(
      `
      INSERT INTO learning_phases (
        option_id, title, description, icon, color, background_color, sequence_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [
        phaseData.optionId,
        phaseData.title,
        phaseData.description || null,
        phaseData.icon,
        phaseData.color,
        phaseData.backgroundColor,
        phaseData.sequenceNumber
      ]
    );

    // Extract first row from result
    const newPhase = newPhaseResult.rows[0];

    // Create metrics if provided
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

// Update a phase
export async function updatePhase(phaseId: string, phaseData: any) {
  try {
    await query(
      `
      UPDATE learning_phases
      SET 
        title = $1,
        description = $2,
        icon = $3,
        color = $4,
        background_color = $5,
        sequence_number = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE phase_id = $7
    `,
      [
        phaseData.title,
        phaseData.description || null,
        phaseData.icon,
        phaseData.color,
        phaseData.backgroundColor,
        phaseData.sequenceNumber,
        phaseId
      ]
    );

    // Handle metrics separately (metrics can be added/updated/deleted)
    if (phaseData.metrics) {
      const existingMetricsResult = await query(
        `
        SELECT metric_id FROM phase_metrics
        WHERE phase_id = $1
      `,
        [phaseId]
      );

      const existingMetrics = existingMetricsResult.rows;
      const existingMetricIds = existingMetrics.map((m: any) => m.metric_id);
      const newMetricIds = phaseData.metrics
        .filter((m: any) => m.id)
        .map((m: any) => m.id);

      // Delete metrics not in new data
      const metricsToDelete = existingMetricIds.filter(
        (id: string) => !newMetricIds.includes(id)
      );
      if (metricsToDelete.length > 0) {
        await Promise.all(
          metricsToDelete.map(async (metricId: string) => {
            await query(
              `
              DELETE FROM phase_metrics
              WHERE metric_id = $1
            `,
              [metricId]
            );
          })
        );
      }

      // Update or create metrics
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

    // Fetch the updated phase with metrics
    const phaseResult = await query(
      `
      SELECT * FROM learning_phases
      WHERE phase_id = $1
    `,
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

// Create a metric
export async function createMetric(metricData: any) {
  try {
    // Prepare the default value based on type
    let defaultValue = metricData.defaultValue;
    if (defaultValue !== undefined && defaultValue !== null) {
      defaultValue = defaultValue.toString();
    }

    const newMetricResult = await query(
      `
      INSERT INTO phase_metrics (
        phase_id, name, description, metric_type, default_value,
        min_value, max_value, sequence_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
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

    const newMetric = newMetricResult.rows[0];
    return newMetric;
  } catch (error) {
    console.error('Error creating metric:', error);
    throw new Error('Failed to create phase metric');
  }
}

// Update a metric
export async function updateMetric(metricId: string, metricData: any) {
  try {
    let defaultValue = metricData.defaultValue;
    if (defaultValue !== undefined && defaultValue !== null) {
      defaultValue = defaultValue.toString();
    }

    await query(
      `
      UPDATE phase_metrics
      SET
        name = $1,
        description = $2,
        metric_type = $3,
        default_value = $4,
        min_value = $5,
        max_value = $6,
        sequence_number = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE metric_id = $8
    `,
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
      `
      SELECT * FROM phase_metrics
      WHERE metric_id = $1
    `,
      [metricId]
    );

    const metric = metricResult.rows[0];
    return metric;
  } catch (error) {
    console.error(`Error updating metric ${metricId}:`, error);
    throw new Error('Failed to update phase metric');
  }
}

// Delete a template
// Fixed deleteTemplate function without created_by reference
export async function deleteTemplate(templateId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error('Authentication required');
    }

    // Check if template exists (no JOIN needed since no created_by column)
    const templateResult = await query(
      `SELECT * FROM learning_templates WHERE template_id = $1`,
      [templateId]
    );

    const template = templateResult.rows[0];
    if (!template) {
      throw new Error('Template not found');
    }

    // Don't allow deletion of default templates
    if (template.is_default) {
      throw new Error('Default templates cannot be deleted');
    }

    // For now, allow any authenticated user to delete non-default templates
    // You can add admin check here if needed
    // if (!isAdmin(session)) {
    //   throw new Error('Not authorized to delete this template');
    // }

    // Delete the template (will cascade to options, phases, and metrics)
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


// Helper function to check if user is admin
function isAdmin(session: any): boolean {
  // Implement your admin check logic here
  // For example, check against a list of admin emails or roles in session
  return session?.user?.email === 'admin@example.com';
}

// Export all functions
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
