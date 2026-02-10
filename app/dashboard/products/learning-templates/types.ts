// app/dashboard/products/learning-templates/types.ts - UPDATED: AI at phase level

export type PhaseMetric = {
  id: string;
  name: string;
  description?: string;
  defaultValue?: number | string;
  type: 'percentage' | 'time' | 'count' | 'rating' | 'text';
  min?: number;
  max?: number;
};

// AI content generation configuration (AT PHASE LEVEL)
export type AIContentGeneration = {
  enabled: boolean;
  capabilities: string[];
  basePrompt: string;
};

export type LearningPhase = {
  id: string;
  title: string;
  icon: string;
  color: string;
  backgroundColor: string;
  metrics: PhaseMetric[];
  description?: string;
  
  // AI content generation at phase level
  aiContentGeneration?: AIContentGeneration;
};

export type LearningOption = {
  id: string;
  name: string;
  description?: string;
  phases: LearningPhase[];
};

// Complexity level configuration (STAYS AT TEMPLATE LEVEL)
export type ComplexityLevel = 'easy' | 'medium' | 'hard';

export type ComplexityConfig = {
  name: string;
  description: string;
  targetAccuracy: number;
  aiPrompt: string;
};

export type ComplexityLevels = {
  easy: ComplexityConfig;
  medium: ComplexityConfig;
  hard: ComplexityConfig;
};

export type LearningTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  options: LearningOption[];
  templateCategory?: 'reading' | 'problem-solving' | 'lecture';
  isActive?: boolean;
  isDefault?: boolean;
  
  // Complexity levels (stays at template level)
  complexityLevels?: ComplexityLevels;
};

// Helper functions

export function getLearningTemplate(templateId: string, templates: LearningTemplate[]): LearningTemplate | undefined {
  return templates.find(template => template.id === templateId);
}

export function getLearningOption(templateId: string, optionId: string, templates: LearningTemplate[]): LearningOption | undefined {
  const template = getLearningTemplate(templateId, templates);
  return template?.options.find(option => option.id === optionId);
}

export function getPhasesByTemplateAndOption(templateId: string, optionId: string, templates: LearningTemplate[]): LearningPhase[] {
  const option = getLearningOption(templateId, optionId, templates);
  return option?.phases || [];
}

export function findPhaseFromTemplate(
  templateId: string,
  optionId: string,
  phaseId: string,
  templates: LearningTemplate[]
): LearningPhase | undefined {
  const template = getLearningTemplate(templateId, templates);
  const option = template?.options.find(o => o.id === optionId);
  return option?.phases.find(p => p.id === phaseId);
}

// Complexity helper functions (template level)
export function getComplexityConfig(
  template: LearningTemplate,
  level: ComplexityLevel
): ComplexityConfig | undefined {
  return template.complexityLevels?.[level];
}

export function hasComplexityLevels(template: LearningTemplate): boolean {
  return !!template.complexityLevels && 
         !!template.complexityLevels.easy && 
         !!template.complexityLevels.medium && 
         !!template.complexityLevels.hard;
}

// AI helper functions (NOW FOR PHASES)
export function hasAIGeneration(phase: LearningPhase): boolean {
  return phase.aiContentGeneration?.enabled ?? false;
}

export function hasAICapability(phase: LearningPhase, capability: string): boolean {
  return phase.aiContentGeneration?.capabilities?.includes(capability) ?? false;
}

export function getAIBasePrompt(phase: LearningPhase): string | undefined {
  return phase.aiContentGeneration?.basePrompt;
}

// Get combined AI prompt (phase base + complexity modifier)
export function getCombinedAIPrompt(
  template: LearningTemplate,
  phase: LearningPhase,
  level: ComplexityLevel
): string | undefined {
  const phasePrompt = getAIBasePrompt(phase);
  const complexityConfig = getComplexityConfig(template, level);
  
  if (!phasePrompt || !complexityConfig?.aiPrompt) {
    return phasePrompt || complexityConfig?.aiPrompt;
  }
  
  return `${phasePrompt}\n\nComplexity Level Instructions:\n${complexityConfig.aiPrompt}`;
}

// Get all phases with AI across all options
export function getPhasesWithAI(template: LearningTemplate): LearningPhase[] {
  const phases: LearningPhase[] = [];
  template.options.forEach(option => {
    option.phases.forEach(phase => {
      if (hasAIGeneration(phase)) {
        phases.push(phase);
      }
    });
  });
  return phases;
}

// Check if template has any phases with AI
export function hasAnyAIPhases(template: LearningTemplate): boolean {
  return getPhasesWithAI(template).length > 0;
}

// Get all AI capabilities across all phases
export function getAllAICapabilities(template: LearningTemplate): string[] {
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