// app/dashboard/products/learning-templates/types.ts

export type PhaseMetric = {
    id: string;
    name: string;
    description?: string;
    defaultValue?: number | string;
    type: 'percentage' | 'time' | 'count' | 'rating' | 'text';
    min?: number;
    max?: number;
  };
  
  export type LearningPhase = {
    id: string;
    title: string;
    icon: string;
    color: string;
    backgroundColor: string;
    metrics: PhaseMetric[];
    description?: string;
  };
  
  export type LearningOption = {
    id: string;
    name: string;
    description?: string;
    phases: LearningPhase[];
  };
  
  export type LearningTemplate = {
    id: string;
    name: string;
    description: string;
    icon: string;
    options: LearningOption[];
  };
  
  export const LEARNING_TEMPLATES: LearningTemplate[] = [
    {
      id: 'problem-solving',
      name: 'Problem Solving',
      description: 'Approach mathematical, scientific, or logical problems methodically',
      icon: 'math-compass',
      options: [
        {
          id: 'three-phase',
          name: '3-Phase Approach',
          description: 'Break down problems into understanding, planning, and solving',
          phases: [
            {
              id: 'understand',
              title: 'Understanding',
              icon: 'brain',
              color: 'rgba(98, 102, 241, 1)', // Indigo
              backgroundColor: 'rgba(98, 102, 241, 0.1)',
              metrics: [
                { id: 'time-spent', name: 'Time Spent', type: 'time', defaultValue: 0 },
                { id: 'questions', name: 'Clarifying Questions', type: 'count', defaultValue: 0 },
                { id: 'confidence', name: 'Initial Confidence', type: 'percentage', defaultValue: 50, min: 0, max: 100 }
              ]
            },
            {
              id: 'plan',
              title: 'Planning',
              icon: 'lightbulb',
              color: 'rgba(139, 92, 246, 1)', // Purple
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              metrics: [
                { id: 'strategies', name: 'Strategies Considered', type: 'count', defaultValue: 0 },
                { id: 'revisions', name: 'Plan Revisions', type: 'count', defaultValue: 0 },
                { id: 'time-spent', name: 'Time Spent', type: 'time', defaultValue: 0 }
              ]
            },
            {
              id: 'solve',
              title: 'Solution',
              icon: 'check-circle',
              color: 'rgba(236, 72, 153, 1)', // Pink
              backgroundColor: 'rgba(236, 72, 153, 0.1)',
              metrics: [
                { id: 'accuracy', name: 'Accuracy', type: 'percentage', defaultValue: 100 },
                { id: 'speed', name: 'Time to Solve', type: 'time', defaultValue: 0 },
                { id: 'efficiency', name: 'Efficiency', type: 'rating', min: 1, max: 5, defaultValue: 3 },
                { id: 'hints', name: 'Hints Used', type: 'count', defaultValue: 0 },
                { id: 'errors', name: 'Errors Made', type: 'count', defaultValue: 0 }
              ]
            }
          ]
        },
        {
          id: 'two-phase',
          name: '2-Phase Approach',
          description: 'Streamlined process with analysis and solution phases',
          phases: [
            {
              id: 'analyze',
              title: 'Analysis',
              icon: 'magnify',
              color: 'rgba(98, 102, 241, 1)', // Indigo
              backgroundColor: 'rgba(98, 102, 241, 0.1)',
              metrics: [
                { id: 'time-spent', name: 'Time Spent Analyzing', type: 'time', defaultValue: 0 },
                { id: 'questions', name: 'Clarifying Questions', type: 'count', defaultValue: 0 },
                { id: 'approaches', name: 'Potential Approaches', type: 'count', defaultValue: 0 },
                { id: 'confidence', name: 'Initial Confidence', type: 'percentage', defaultValue: 50 }
              ]
            },
            {
              id: 'solve',
              title: 'Solution',
              icon: 'check-circle',
              color: 'rgba(236, 72, 153, 1)', // Pink
              backgroundColor: 'rgba(236, 72, 153, 0.1)',
              metrics: [
                { id: 'accuracy', name: 'Accuracy', type: 'percentage', defaultValue: 100 },
                { id: 'speed', name: 'Time to Solve', type: 'time', defaultValue: 0 },
                { id: 'efficiency', name: 'Efficiency', type: 'rating', min: 1, max: 5, defaultValue: 3 },
                { id: 'mistakes', name: 'Mistakes Made', type: 'count', defaultValue: 0 },
                { id: 'hints', name: 'Hints Used', type: 'count', defaultValue: 0 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'reading',
      name: 'Book / PDF Reading',
      description: 'Structured approach to reading and annotating documents',
      icon: 'book-open-page-variant',
      options: [
        {
          id: 'three-phase',
          name: '3-Phase Reading',
          description: 'Preview, read & annotate, and reflect on reading material',
          phases: [
            {
              id: 'preview',
              title: 'Preview',
              icon: 'eye',
              color: 'rgba(6, 182, 212, 1)', // Cyan
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              metrics: [
                { id: 'skim-time', name: 'Skim Time', type: 'time', defaultValue: 0 },
                { id: 'initial-questions', name: 'Initial Questions', type: 'count', defaultValue: 0 }
              ]
            },
            {
              id: 'read',
              title: 'Read & Annotate',
              icon: 'text-box-edit',
              color: 'rgba(14, 165, 233, 1)', // Sky
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              metrics: [
                { id: 'reading-time', name: 'Reading Time', type: 'time', defaultValue: 0 },
                { id: 'annotations', name: 'Annotations', type: 'count', defaultValue: 0 },
                { id: 'sections-covered', name: 'Sections Covered', type: 'count', defaultValue: 0 }
              ]
            },
            {
              id: 'reflect',
              title: 'Reflect',
              icon: 'thought-bubble',
              color: 'rgba(2, 132, 199, 1)', // Blue
              backgroundColor: 'rgba(2, 132, 199, 0.1)',
              metrics: [
                { id: 'summary-quality', name: 'Summary Quality', type: 'rating', min: 1, max: 5, defaultValue: 3 },
                { id: 'followup-questions', name: 'Follow-up Questions', type: 'count', defaultValue: 0 },
                { id: 'understanding', name: 'Self-Assessed Understanding', type: 'percentage', defaultValue: 50 }
              ]
            }
          ]
        },
        {
          id: 'two-phase',
          name: '2-Phase Reading',
          description: 'Skim and detailed reading approach',
          phases: [
            {
              id: 'skim',
              title: 'Skim',
              icon: 'fast-forward',
              color: 'rgba(6, 182, 212, 1)', // Cyan
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              metrics: [
                { id: 'skim-time', name: 'Skim Time', type: 'time', defaultValue: 0 },
                { id: 'sections-previewed', name: 'Sections Previewed', type: 'count', defaultValue: 0 },
                { id: 'initial-questions', name: 'Initial Questions', type: 'count', defaultValue: 0 }
              ]
            },
            {
              id: 'detailed',
              title: 'Detailed Read',
              icon: 'book-open-variant',
              color: 'rgba(14, 165, 233, 1)', // Sky
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              metrics: [
                { id: 'reading-time', name: 'Reading Time', type: 'time', defaultValue: 0 },
                { id: 'annotations', name: 'Annotations', type: 'count', defaultValue: 0 },
                { id: 'completion', name: 'Completion Percentage', type: 'percentage', defaultValue: 0 },
                { id: 'final-summary', name: 'Final Summary', type: 'text' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'lecture',
      name: 'Recorded Lecture',
      description: 'Structured approach to watching and reviewing lecture videos',
      icon: 'video',
      options: [
        {
          id: 'three-phase',
          name: '3-Phase Lecture',
          description: 'Preview, watch, and review recorded lectures',
          phases: [
            {
              id: 'preview',
              title: 'Preview',
              icon: 'clipboard-text',
              color: 'rgba(249, 115, 22, 1)', // Orange
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              metrics: [
                { id: 'preview-time', name: 'Preview Time', type: 'time', defaultValue: 0 },
                { id: 'initial-questions', name: 'Initial Questions', type: 'count', defaultValue: 0 }
              ]
            },
            {
              id: 'watch',
              title: 'Watch',
              icon: 'play-circle',
              color: 'rgba(234, 88, 12, 1)', // Amber
              backgroundColor: 'rgba(234, 88, 12, 0.1)',
              metrics: [
                { id: 'watch-duration', name: 'Watch Duration', type: 'time', defaultValue: 0 },
                { id: 'completion', name: 'Completion Percentage', type: 'percentage', defaultValue: 0 },
                { id: 'pauses', name: 'Pauses/Rewinds', type: 'count', defaultValue: 0 }
              ]
            },
            {
              id: 'review',
              title: 'Review',
              icon: 'note-text',
              color: 'rgba(217, 70, 0, 1)', // Red
              backgroundColor: 'rgba(217, 70, 0, 0.1)',
              metrics: [
                { id: 'summary-quality', name: 'Summary Quality', type: 'rating', min: 1, max: 5, defaultValue: 3 },
                { id: 'followup-questions', name: 'Follow-up Questions', type: 'count', defaultValue: 0 },
                { id: 'clarity', name: 'Self-Assessed Clarity', type: 'percentage', defaultValue: 50 }
              ]
            }
          ]
        },
        {
          id: 'two-phase',
          name: '2-Phase Lecture',
          description: 'Watch and reflect on recorded lectures',
          phases: [
            {
              id: 'watch',
              title: 'Watch',
              icon: 'play-circle',
              color: 'rgba(234, 88, 12, 1)', // Amber
              backgroundColor: 'rgba(234, 88, 12, 0.1)',
              metrics: [
                { id: 'watch-time', name: 'Watch Time', type: 'time', defaultValue: 0 },
                { id: 'rewinds', name: 'Rewinds', type: 'count', defaultValue: 0 },
                { id: 'completion', name: 'Completion Percentage', type: 'percentage', defaultValue: 0 }
              ]
            },
            {
              id: 'reflect',
              title: 'Reflect',
              icon: 'thought-bubble',
              color: 'rgba(217, 70, 0, 1)', // Red
              backgroundColor: 'rgba(217, 70, 0, 0.1)',
              metrics: [
                { id: 'summary', name: 'Summary Created', type: 'text' },
                { id: 'questions', name: 'Additional Questions', type: 'count', defaultValue: 0 },
                { id: 'clarity', name: 'Self-Assessed Clarity', type: 'percentage', defaultValue: 50 }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  // Helper functions to get templates and phases
  export function getLearningTemplate(templateId: string): LearningTemplate | undefined {
    return LEARNING_TEMPLATES.find(template => template.id === templateId);
  }
  
  export function getLearningOption(templateId: string, optionId: string): LearningOption | undefined {
    const template = getLearningTemplate(templateId);
    return template?.options.find(option => option.id === optionId);
  }
  
  export function getPhasesByTemplateAndOption(templateId: string, optionId: string): LearningPhase[] {
    const option = getLearningOption(templateId, optionId);
    return option?.phases || [];
  }
  
  /**
  * Return the matching phase object from the user's chosen template + option.
  * E.g. findPhaseFromTemplate('problem-solving', 'two-phase', 'analyze')
  */
  export function findPhaseFromTemplate(
    templateId: string,
    optionId: string,
    phaseId: string
  ): LearningPhase | undefined {
    const template = getLearningTemplate(templateId);
    const option = template?.options.find(o => o.id === optionId);
    return option?.phases.find(p => p.id === phaseId);
  }
  
  // Add a special "All" phase for viewing all phases together
  export function getAllPhase(): LearningPhase {
    return {
      id: 'all',
      title: 'All',
      icon: 'cube-outline',
      color: 'rgba(52, 211, 153, 1)', // Teal
      backgroundColor: 'rgba(52, 211, 153, 0.1)',
      metrics: [
        { id: 'phases', name: 'Phases', type: 'count', defaultValue: 0 },
        { id: 'pages', name: 'Pages', type: 'count', defaultValue: 0 },
        { id: 'overview', name: 'Overview', type: 'percentage', defaultValue: 100 }
      ]
    };
  }