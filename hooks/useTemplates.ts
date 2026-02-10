// hooks/useTemplates.ts - UPDATED: AI at phase level
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type TemplateCategory = 'reading' | 'problem-solving' | 'lecture';
export type ComplexityLevel = 'easy' | 'medium' | 'hard';

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

export interface AIContentGeneration {
  enabled: boolean;
  capabilities: string[];
  basePrompt: string;
}

export interface Metric {
  id: string;
  name: string;
  description?: string;
  type: 'percentage' | 'time' | 'count' | 'rating' | 'text';
  defaultValue?: number | string;
  min?: number;
  max?: number;
}

export interface Phase {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  backgroundColor: string;
  aiContentGeneration?: AIContentGeneration; // AI AT PHASE LEVEL
  metrics: Metric[];
}

export interface Option {
  id: string;
  name: string;
  description?: string;
  phases: Phase[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
  ownerId?: string;
  templateCategory: TemplateCategory;
  complexityLevels?: ComplexityLevels;
  options: Option[];
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all templates
export function useTemplates() {
  return useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('/admin/api/learning-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    },
  });
}

// Create template
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (templateData: Partial<Template>) => {
      const response = await fetch('/admin/api/learning-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create template');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

// Update template
export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, template }: { id: string; template: Partial<Template> }) => {
      const response = await fetch(`/admin/api/learning-templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update template');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

// Delete template
export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/admin/api/learning-templates/${templateId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete template');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

// ============================================================
// COMPLEXITY HELPER FUNCTIONS (Template Level)
// ============================================================

export function hasComplexityLevels(template: Template): boolean {
  return !!template.complexityLevels && 
         !!template.complexityLevels.easy && 
         !!template.complexityLevels.medium && 
         !!template.complexityLevels.hard;
}

export function getComplexityConfig(
  template: Template, 
  level: ComplexityLevel
): ComplexityConfig | undefined {
  return template.complexityLevels?.[level];
}

export function getComplexityLevels(template: Template): ComplexityLevel[] {
  const levels: ComplexityLevel[] = [];
  if (template.complexityLevels?.easy) levels.push('easy');
  if (template.complexityLevels?.medium) levels.push('medium');
  if (template.complexityLevels?.hard) levels.push('hard');
  return levels;
}

// ============================================================
// AI HELPER FUNCTIONS (Phase Level - UPDATED)
// ============================================================

export function hasAIGeneration(phase: Phase): boolean {
  return phase.aiContentGeneration?.enabled ?? false;
}

export function hasAICapability(phase: Phase, capability: string): boolean {
  return phase.aiContentGeneration?.capabilities?.includes(capability) ?? false;
}

export function getAIBasePrompt(phase: Phase): string | undefined {
  return phase.aiContentGeneration?.basePrompt;
}

export function getCombinedAIPrompt(
  template: Template,
  phase: Phase,
  level: ComplexityLevel
): string | undefined {
  const phasePrompt = getAIBasePrompt(phase);
  const complexityConfig = getComplexityConfig(template, level);
  
  if (!phasePrompt && !complexityConfig?.aiPrompt) {
    return undefined;
  }
  
  if (!phasePrompt) {
    return complexityConfig?.aiPrompt;
  }
  
  if (!complexityConfig?.aiPrompt) {
    return phasePrompt;
  }
  
  return `${phasePrompt}\n\nComplexity Level Instructions:\n${complexityConfig.aiPrompt}`;
}

export function getPhasesWithAI(template: Template): Phase[] {
  const phases: Phase[] = [];
  template.options.forEach(option => {
    option.phases.forEach(phase => {
      if (hasAIGeneration(phase)) {
        phases.push(phase);
      }
    });
  });
  return phases;
}

export function hasAnyAIPhases(template: Template): boolean {
  return getPhasesWithAI(template).length > 0;
}

export function getAllAICapabilities(template: Template): string[] {
  const allCapabilities = new Set<string>();
  
  template.options.forEach(option => {
    option.phases.forEach(phase => {
      if (phase.aiContentGeneration?.capabilities) {
        phase.aiContentGeneration.capabilities.forEach(cap => allCapabilities.add(cap));
      }
    });
  });
  
  return Array.from(allCapabilities);
}

// ============================================================
// COMBINED FEATURE CHECKS
// ============================================================

export function hasAdvancedFeatures(template: Template): boolean {
  return hasComplexityLevels(template) && hasAnyAIPhases(template);
}

export function getTemplateFeatures(template: Template) {
  return {
    hasComplexity: hasComplexityLevels(template),
    hasAI: hasAnyAIPhases(template),
    complexityLevels: getComplexityLevels(template),
    aiEnabledPhases: getPhasesWithAI(template).length,
    totalPhases: template.options.reduce((sum, opt) => sum + opt.phases.length, 0),
    aiCapabilities: getAllAICapabilities(template)
  };
}