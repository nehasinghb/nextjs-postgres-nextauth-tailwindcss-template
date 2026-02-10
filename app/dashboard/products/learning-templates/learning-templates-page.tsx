'use client';

import { useState, useEffect } from 'react';
import { BulkUploadDialog } from '@/components/bulk-upload-dialog';
import { Upload } from 'lucide-react';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate, Template, Option, Phase, Metric } from '@/hooks/useTemplates';
import { 
  Book, 
  BookOpen, 
  Video, 
  PlusCircle, 
  Pencil,
  ChevronRight, 
  Brain, 
  Lightbulb, 
  CheckCircle, 
  Eye,
  FileEdit, 
  ThumbsUp, 
  FastForward, 
  PlayCircle,
  Clipboard, 
  FileText, 
  ChevronsUpDown, 
  Search,
  Plus, 
  Trash2, 
  Copy, 
  MoreHorizontal,
  X,
    Settings,      // ADD THIS
  Target,        // ADD THIS
  Sparkles      // ADD THIS
} from 'lucide-react';
import Link from 'next/link';

import {
  AlertCircle    // ✅ ADD THIS if missing
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


const TemplateDetailsDialog = ({ 
  template, 
  open, 
  onOpenChange 
}: { 
  template: Template | null, 
  open: boolean, 
  onOpenChange: (open: boolean) => void 
}) => {
  if (!template) return null;

  const hasComplexity = template.complexityLevels && 
    (template.complexityLevels.easy || template.complexityLevels.medium || template.complexityLevels.hard);
  
  // NEW: Check which options have AI
  const optionsWithAI = template.options.filter(
    opt => opt.aiContentGeneration?.enabled
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {template.name} - Configuration
          </DialogTitle>
          <DialogDescription>
            View complexity levels and AI configuration for this template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Complexity Levels Section - UNCHANGED */}
          {hasComplexity ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Content Generation (Phase Level)
                </CardTitle>
                <CardDescription>
                  AI capabilities configured per learning phase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.options.map(option => (
                  <div key={option.id} className="space-y-2">
                    <div className="font-medium text-sm">{option.name}</div>
                    {option.phases.map(phase => {
                      const hasAI = phase.aiContentGeneration?.enabled;
                      if (!hasAI) return null;
                      
                      return (
                        <div key={phase.id} className="bg-muted/50 border rounded-lg p-3 ml-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {phase.title}
                            </Badge>
                          </div>
                          <div className="text-xs space-y-2">
                            <div>
                              <span className="font-medium">Capabilities:</span>{' '}
                              {phase.aiContentGeneration!.capabilities.join(', ')}
                            </div>
                            <div>
                              <span className="font-medium">Base Prompt:</span>
                              <div className="mt-1 p-2 bg-background rounded text-xs">
                                {phase.aiContentGeneration!.basePrompt}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {option.phases.every(p => !p.aiContentGeneration?.enabled) && (
                      <div className="text-xs text-muted-foreground ml-4">
                        No AI-enabled phases in this option
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-muted">
              <CardContent className="pt-6">
                <div className="text-center text-sm text-muted-foreground py-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No adaptive complexity configured for this template
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Content Generation Section - COMPLETELY NEW */}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
// Icon mapping for template icons
const getTemplateIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'math-compass': Book,
    'book-open-page-variant': BookOpen,
    'video': Video,
  };
  return iconMap[iconName] || Book;
};

// Icon mapping for phase icons
const getPhaseIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'brain': Brain,
    'lightbulb': Lightbulb,
    'check-circle': CheckCircle,
    'magnify': Search,
    'eye': Eye,
    'text-box-edit': FileEdit,
    'thought-bubble': ThumbsUp,
    'fast-forward': FastForward, 
    'book-open-variant': BookOpen,
    'play-circle': PlayCircle,
    'clipboard-text': Clipboard,
    'note-text': FileText,
    'cube-outline': ChevronsUpDown,
  };
  return iconMap[iconName] || Brain;
};

// List of available metric types with display names
const metricTypes = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'time', label: 'Time' },
  { value: 'count', label: 'Count' },
  { value: 'rating', label: 'Rating' },
  { value: 'text', label: 'Text' },
];

// Component to display color picker
const ColorPicker = ({ color, onChange }: { color: string, onChange: (color: string) => void }) => {
  const colors = [
    'rgba(98, 102, 241, 1)',   // Indigo
    'rgba(139, 92, 246, 1)',   // Purple
    'rgba(236, 72, 153, 1)',   // Pink
    'rgba(6, 182, 212, 1)',    // Cyan
    'rgba(14, 165, 233, 1)',   // Sky
    'rgba(2, 132, 199, 1)',    // Blue
    'rgba(249, 115, 22, 1)',   // Orange
    'rgba(234, 88, 12, 1)',    // Amber
    'rgba(217, 70, 0, 1)',     // Red
    'rgba(52, 211, 153, 1)',   // Teal
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {colors.map((c) => (
        <div 
          key={c}
          className={`w-6 h-6 rounded-full cursor-pointer ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
          style={{ backgroundColor: c }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
};

// Component to display a phase metric
const PhaseMetricItem = ({ 
  metric, 
  onEdit, 
  onDelete 
}: { 
  metric: Metric, 
  onEdit: (metric: Metric) => void, 
  onDelete: (metricId: string) => void 
}) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md bg-background">
      <div className="flex-1 ml-3">
        <p className="font-medium">{metric.name}</p>
        <div className="flex items-center space-x-2 mt-1">
          <Badge variant="outline">{
            metricTypes.find(t => t.value === metric.type)?.label || metric.type
          }</Badge>
          {metric.min !== undefined && metric.max !== undefined && (
            <Badge variant="outline">Range: {metric.min}-{metric.max}</Badge>
          )}
          {metric.defaultValue !== undefined && (
            <Badge variant="outline">Default: {metric.defaultValue}</Badge>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(metric)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(metric.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Component to display a learning phase
const PhaseItem = ({ 
  phase, 
  onEdit, 
  onDelete,
  onEditMetrics
}: { 
  phase: Phase, 
  onEdit: (phase: Phase) => void, 
  onDelete: (phaseId: string) => void,
  onEditMetrics: (phase: Phase) => void
}) => {
  const Icon = getPhaseIcon(phase.icon);
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md" style={{ backgroundColor: phase.backgroundColor }}>
              <Icon className="h-5 w-5" style={{ color: phase.color }} />
            </div>
            <CardTitle>{phase.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(phase)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Phase
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditMetrics(phase)}>
                <Copy className="h-4 w-4 mr-2" />
                Manage Metrics
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(phase.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Phase
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {phase.description && (
          <CardDescription>{phase.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm font-medium">Metrics ({phase.metrics.length})</div>
          <div className="space-y-2">
            {phase.metrics.length > 0 ? (
              phase.metrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between text-sm border p-2 rounded">
                  <span>{metric.name}</span>
                  <Badge variant="outline">{metricTypes.find(t => t.value === metric.type)?.label || metric.type}</Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No metrics defined</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component to display an option accordion
const OptionAccordion = ({ 
  option, 
  templateId,
  onEdit, 
  onDelete,
  onAddPhase, 
  onEditPhase,
  onDeletePhase,
  onEditMetrics
}: { 
  option: Option, 
  templateId: string,
  onEdit: (option: Option) => void, 
  onDelete: (optionId: string) => void,
  onAddPhase: (optionId: string) => void,
  onEditPhase: (phase: Phase) => void,
  onDeletePhase: (phaseId: string) => void,
  onEditMetrics: (phase: Phase) => void
}) => {
  return (
    <AccordionItem value={option.id} className="border rounded-md px-0 mb-4">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center space-x-3 w-full">
          <div className="font-medium">{option.name}</div>
          <Badge variant="outline">{option.phases.length} phases</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-0 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">{option.description}</div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(option)}>
              <Pencil className="h-4 w-4 mr-1" /> Edit Option
            </Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => onDelete(option.id)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {option.phases.map((phase) => (
            <PhaseItem 
              key={phase.id} 
              phase={phase}
              onEdit={onEditPhase}
              onDelete={onDeletePhase}
              onEditMetrics={onEditMetrics}
            />
          ))}
          
          <Button 
            className="w-full"
            variant="outline"
            onClick={() => onAddPhase(option.id)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add New Phase
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

// REPLACE the TemplateCard component in learning-templates-page.tsx
// REPLACE the TemplateCard component in learning-templates-page.tsx
// Fixed: Edit Template button doesn't navigate and matches Manage Options button style
// REPLACE the TemplateCard component - adds complexity badge display

const TemplateCard = ({ 
  template, 
  onEdit, 
  onDelete,
  onManageOptions
}: { 
  template: Template, 
  onEdit: (template: Template) => void, 
  onDelete: (templateId: string) => void,
  onManageOptions: (templateId: string) => void
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const Icon = getTemplateIcon(template.icon);
  
  // Check which phases have AI enabled
  const aiEnabledPhases = template.options.reduce((count, option) => {
    return count + option.phases.filter(phase => phase.aiContentGeneration?.enabled).length;
  }, 0);
  const totalPhases = template.options.reduce((count, option) => count + option.phases.length, 0);
  const hasAnyAI = aiEnabledPhases > 0;
  
  // NEW: Get complexity level
  const complexityLevel = template.complexityLevels?.easy ? 'Easy' :
                         template.complexityLevels?.medium ? 'Medium' :
                         template.complexityLevels?.hard ? 'Hard' : null;
  
  // FIX: Handle edit without navigation
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(template);
  };
  
  return (
    <>
      <Card className="w-full h-full overflow-hidden">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-md" style={{ 
                backgroundColor: template.name === 'Problem Solving' ? 'rgba(98, 102, 241, 0.1)' : 
                                template.name === 'Book / PDF Reading' ? 'rgba(6, 182, 212, 0.1)' : 
                                'rgba(249, 115, 22, 0.1)' 
              }}>
                <Icon className="h-5 w-5" style={{ 
                  color: template.name === 'Problem Solving' ? 'rgba(98, 102, 241, 1)' : 
                         template.name === 'Book / PDF Reading' ? 'rgba(6, 182, 212, 1)' : 
                         'rgba(249, 115, 22, 1)' 
                }} />
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetails(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(template)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManageOptions(template.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Manage Options
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(template.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className="text-xs mt-1">{template.description}</CardDescription>
          
          {/* NEW: Complexity Badge - show if configured */}
          {complexityLevel && (
            <div className="mt-2">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  complexityLevel === 'Easy' && "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
                  complexityLevel === 'Medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
                  complexityLevel === 'Hard' && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                )}
              >
                <Target className="h-3 w-3 mr-1" />
                Complexity: {complexityLevel}
              </Badge>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-3 pt-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-xs font-medium">Approaches</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{template.options.length} options</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowDetails(true)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
              </div>
            </div>
            
            {template.options.map((option) => {
              // Count AI-enabled phases in this option
              const aiPhasesInOption = option.phases.filter(p => p.aiContentGeneration?.enabled).length;
              
              return (
                <div key={option.id} className="rounded-md border">
                  <div className="bg-muted/40 px-2 py-1.5 border-b">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-xs">{option.name}</div>
                      {aiPhasesInOption > 0 && (
                        <Badge variant="secondary" className="text-xs h-4">
                          <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                          {aiPhasesInOption} AI
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{option.description}</div>
                  </div>
                  <div className="p-2">
                    <div className="flex flex-wrap gap-1.5">
                      {option.phases.slice(0, 4).map((phase) => {
                        const PhaseIcon = getPhaseIcon(phase.icon);
                        const hasAI = phase.aiContentGeneration?.enabled;
                        return (
                          <div 
                            key={phase.id} 
                            className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-xs relative"
                            style={{ 
                              backgroundColor: phase.backgroundColor,
                              color: phase.color
                            }}
                          >
                            <PhaseIcon className="h-2.5 w-2.5" />
                            <span className="text-xs truncate max-w-28">{phase.title}</span>
                            {hasAI && <Sparkles className="h-2 w-2" />}
                          </div>
                        );
                      })}
                      {option.phases.length > 4 && (
                        <div className="px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{option.phases.length - 4} more
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5 text-xs text-muted-foreground">
                      {option.phases.length} phase{option.phases.length !== 1 ? 's' : ''} •
                      {option.phases.reduce((sum, phase) => sum + phase.metrics.length, 0)} metric{option.phases.reduce((sum, phase) => sum + phase.metrics.length, 0) !== 1 ? 's' : ''}
                      {aiPhasesInOption > 0 && (
                        <> • {aiPhasesInOption} AI-enabled</>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        
        <CardFooter className="p-3 pt-0 flex flex-col gap-2">
          <Button 
            className="w-full h-8 text-xs" 
            onClick={handleEditClick}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit Template
          </Button>
          <Button 
            className="w-full h-8 text-xs" 
            onClick={() => onManageOptions(template.id)}
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Manage Options
          </Button>
        </CardFooter>
      </Card>

      {/* Details Dialog */}
      <TemplateDetailsDialog 
        template={template}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
};

// Template Form Component
// Replace the TemplateForm component in learning-templates-page.tsx
// REPLACE the TemplateForm component - COMPLEXITY section only
// Change from checkboxes (multiple) to radio buttons (single selection)

const TemplateForm = ({ 
  template, 
  onSave, 
  onCancel 
}: { 
  template: Template | null, 
  onSave: (template: Partial<Template>) => void, 
  onCancel: () => void 
}) => {

  const [formData, setFormData] = useState<{
    name: string,
    description: string,
    icon: string,
    isActive: boolean,
    templateCategory: 'reading' | 'problem-solving' | 'lecture'
  }>({
    name: '',
    description: '',
    icon: 'book-open-page-variant',
    isActive: true,
    templateCategory: 'reading'
  });

  // CHANGED: Single complexity level selection (radio button behavior)
  const [selectedComplexity, setSelectedComplexity] = useState<'easy' | 'medium' | 'hard' | null>(null);
  
  // Complexity editing state - only one can be active
  const [editingComplexity, setEditingComplexity] = useState<{
    easy: any,
    medium: any,
    hard: any
  }>({
    easy: null,
    medium: null,
    hard: null
  });

  // Update state when template prop changes
  useEffect(() => {
    console.log('[TemplateForm] Template changed:', template);
    
    if (template) {
      console.log('[TemplateForm] Loading template data');
      
      setFormData({
        name: template.name || '',
        description: template.description || '',
        icon: template.icon || 'book-open-page-variant',
        isActive: template.isActive !== undefined ? template.isActive : true,
        templateCategory: template.templateCategory || 'reading'
      });
      
      // Determine which complexity level is selected
      if (template.complexityLevels?.easy) {
        setSelectedComplexity('easy');
        setEditingComplexity({
          easy: template.complexityLevels.easy,
          medium: null,
          hard: null
        });
      } else if (template.complexityLevels?.medium) {
        setSelectedComplexity('medium');
        setEditingComplexity({
          easy: null,
          medium: template.complexityLevels.medium,
          hard: null
        });
      } else if (template.complexityLevels?.hard) {
        setSelectedComplexity('hard');
        setEditingComplexity({
          easy: null,
          medium: null,
          hard: template.complexityLevels.hard
        });
      } else {
        setSelectedComplexity(null);
        setEditingComplexity({
          easy: null,
          medium: null,
          hard: null
        });
      }
    } else {
      console.log('[TemplateForm] Resetting for new template');
      setFormData({
        name: '',
        description: '',
        icon: 'book-open-page-variant',
        isActive: true,
        templateCategory: 'reading'
      });
      
      setSelectedComplexity(null);
      setEditingComplexity({
        easy: null,
        medium: null,
        hard: null
      });
    }
  }, [template?.id, template?.name, template?.description]);
  
  // Handle complexity level selection (radio button)
  const handleComplexitySelect = (level: 'easy' | 'medium' | 'hard') => {
    setSelectedComplexity(level);
    
    // Set default config for selected level, clear others
    const defaultConfigs = {
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
    
    setEditingComplexity({
      easy: level === 'easy' ? (editingComplexity.easy || defaultConfigs.easy) : null,
      medium: level === 'medium' ? (editingComplexity.medium || defaultConfigs.medium) : null,
      hard: level === 'hard' ? (editingComplexity.hard || defaultConfigs.hard) : null
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[TemplateForm] Submitting with data:', formData);
    
    // Build complexityLevels object with only the selected level
    const complexityLevels: any = {};
    if (selectedComplexity === 'easy' && editingComplexity.easy) {
      complexityLevels.easy = editingComplexity.easy;
    } else if (selectedComplexity === 'medium' && editingComplexity.medium) {
      complexityLevels.medium = editingComplexity.medium;
    } else if (selectedComplexity === 'hard' && editingComplexity.hard) {
      complexityLevels.hard = editingComplexity.hard;
    }
    
    const updatedTemplate: Partial<Template> = {
      ...template,
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      isActive: formData.isActive,
      templateCategory: formData.templateCategory,
      complexityLevels: Object.keys(complexityLevels).length > 0 ? complexityLevels : null
    };
    
    onSave(updatedTemplate);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">
            <Settings className="h-4 w-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="complexity">
            <Target className="h-4 w-4 mr-2" />
            Complexity
          </TabsTrigger>
        </TabsList>

        {/* BASIC INFO TAB - UNCHANGED */}
        <TabsContent value="basic" className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Template Name</div>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Problem Solving"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Description</div>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose of this template"
              required
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Template Category <span className="text-destructive">*</span>
            </div>
            <Select
              value={formData.templateCategory}
              onValueChange={(value: 'reading' | 'problem-solving' | 'lecture') =>
                setFormData({ ...formData, templateCategory: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reading">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Reading</span>
                  </div>
                </SelectItem>
                <SelectItem value="problem-solving">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span>Problem Solving</span>
                  </div>
                </SelectItem>
                <SelectItem value="lecture">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span>Lecture/Video</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the main learning activity type for this template
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Icon</div>
            <Select
              value={formData.icon}
              onValueChange={(value) => setFormData({ ...formData, icon: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="math-compass">Problem Solving</SelectItem>
                <SelectItem value="book-open-page-variant">Reading</SelectItem>
                <SelectItem value="video">Video/Lecture</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Template is active
            </label>
          </div>
        </TabsContent>

        {/* COMPLEXITY TAB - CHANGED TO RADIO BUTTONS */}
        <TabsContent value="complexity" className="py-4">
          <div className="space-y-6 max-h-[600px] overflow-y-auto">
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Complexity Level Configuration
                </CardTitle>
                <CardDescription>
                  Choose ONE difficulty level for this template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* EASY LEVEL - RADIO BUTTON */}
                <div className="border rounded-lg p-4 bg-green-50/50 dark:bg-green-950/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">Easy</Badge>
                      <input
                        type="radio"
                        id="select-easy"
                        name="complexity-level"
                        checked={selectedComplexity === 'easy'}
                        onChange={() => handleComplexitySelect('easy')}
                        className="h-4 w-4"
                      />
                      <label htmlFor="select-easy" className="text-sm font-medium cursor-pointer">
                        Select Easy Level
                      </label>
                    </div>
                  </div>
                  
                  {selectedComplexity === 'easy' && editingComplexity.easy && (
                    <div className="space-y-3 mt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium">Level Name</label>
                          <Input
                            value={editingComplexity.easy.name}
                            onChange={(e) => setEditingComplexity({
                              ...editingComplexity,
                              easy: { ...editingComplexity.easy!, name: e.target.value }
                            })}
                            placeholder="e.g., Basic Review"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Target Accuracy (%)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={editingComplexity.easy.targetAccuracy}
                            onChange={(e) => setEditingComplexity({
                              ...editingComplexity,
                              easy: { ...editingComplexity.easy!, targetAccuracy: parseInt(e.target.value) || 0 }
                            })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium">Description</label>
                        <Input
                          value={editingComplexity.easy.description}
                          onChange={(e) => setEditingComplexity({
                            ...editingComplexity,
                            easy: { ...editingComplexity.easy!, description: e.target.value }
                          })}
                          placeholder="Describe this difficulty level"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium">AI Prompt Modifier</label>
                        <Textarea
                          value={editingComplexity.easy.aiPrompt}
                          onChange={(e) => setEditingComplexity({
                            ...editingComplexity,
                            easy: { ...editingComplexity.easy!, aiPrompt: e.target.value }
                          })}
                          placeholder="Complexity-specific instructions for AI"
                          rows={3}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          This will be combined with phase-specific AI prompts
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* MEDIUM LEVEL - RADIO BUTTON */}
                <div className="border rounded-lg p-4 bg-yellow-50/50 dark:bg-yellow-950/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-600">Medium</Badge>
                      <input
                        type="radio"
                        id="select-medium"
                        name="complexity-level"
                        checked={selectedComplexity === 'medium'}
                        onChange={() => handleComplexitySelect('medium')}
                        className="h-4 w-4"
                      />
                      <label htmlFor="select-medium" className="text-sm font-medium cursor-pointer">
                        Select Medium Level
                      </label>
                    </div>
                  </div>
                  
                  {selectedComplexity === 'medium' && editingComplexity.medium && (
                    <div className="space-y-3 mt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium">Level Name</label>
                          <Input
                            value={editingComplexity.medium.name}
                            onChange={(e) => setEditingComplexity({
                              ...editingComplexity,
                              medium: { ...editingComplexity.medium!, name: e.target.value }
                            })}
                            placeholder="e.g., Standard Review"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Target Accuracy (%)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={editingComplexity.medium.targetAccuracy}
                            onChange={(e) => setEditingComplexity({
                              ...editingComplexity,
                              medium: { ...editingComplexity.medium!, targetAccuracy: parseInt(e.target.value) || 0 }
                            })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium">Description</label>
                        <Input
                          value={editingComplexity.medium.description}
                          onChange={(e) => setEditingComplexity({
                            ...editingComplexity,
                            medium: { ...editingComplexity.medium!, description: e.target.value }
                          })}
                          placeholder="Describe this difficulty level"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium">AI Prompt Modifier</label>
                        <Textarea
                          value={editingComplexity.medium.aiPrompt}
                          onChange={(e) => setEditingComplexity({
                            ...editingComplexity,
                            medium: { ...editingComplexity.medium!, aiPrompt: e.target.value }
                          })}
                          placeholder="Complexity-specific instructions for AI"
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* HARD LEVEL - RADIO BUTTON */}
                <div className="border rounded-lg p-4 bg-red-50/50 dark:bg-red-950/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-600">Hard</Badge>
                      <input
                        type="radio"
                        id="select-hard"
                        name="complexity-level"
                        checked={selectedComplexity === 'hard'}
                        onChange={() => handleComplexitySelect('hard')}
                        className="h-4 w-4"
                      />
                      <label htmlFor="select-hard" className="text-sm font-medium cursor-pointer">
                        Select Hard Level
                      </label>
                    </div>
                  </div>
                  
                  {selectedComplexity === 'hard' && editingComplexity.hard && (
                    <div className="space-y-3 mt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium">Level Name</label>
                          <Input
                            value={editingComplexity.hard.name}
                            onChange={(e) => setEditingComplexity({
                              ...editingComplexity,
                              hard: { ...editingComplexity.hard!, name: e.target.value }
                            })}
                            placeholder="e.g., Advanced Review"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Target Accuracy (%)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={editingComplexity.hard.targetAccuracy}
                            onChange={(e) => setEditingComplexity({
                              ...editingComplexity,
                              hard: { ...editingComplexity.hard!, targetAccuracy: parseInt(e.target.value) || 0 }
                            })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium">Description</label>
                        <Input
                          value={editingComplexity.hard.description}
                          onChange={(e) => setEditingComplexity({
                            ...editingComplexity,
                            hard: { ...editingComplexity.hard!, description: e.target.value }
                          })}
                          placeholder="Describe this difficulty level"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium">AI Prompt Modifier</label>
                        <Textarea
                          value={editingComplexity.hard.aiPrompt}
                          onChange={(e) => setEditingComplexity({
                            ...editingComplexity,
                            hard: { ...editingComplexity.hard!, aiPrompt: e.target.value }
                          })}
                          placeholder="Complexity-specific instructions for AI"
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
              </CardContent>
            </Card>

            {/* AI INFO CARD */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      AI Content Generation
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      AI capabilities are configured at the <strong>phase level</strong>, not at the template level. 
                      After creating this template, you can enable AI features for individual phases within each option.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

      </Tabs>

      <DialogFooter className="mt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Template</Button>
      </DialogFooter>
    </form>
  );
};


const OptionForm = ({ 
  option, 
  onSave, 
  onCancel 
}: { 
  option: Option | null, 
  onSave: (option: Partial<Option>) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState<{
    name: string,
    description: string
  }>({
    name: option?.name || '',
    description: option?.description || ''
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedOption: Partial<Option> = {
      ...option,
      name: formData.name,
      description: formData.description
    };
    
    onSave(updatedOption);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Option Name</div>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., 3-Phase Approach"
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Description</div>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this learning option"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};

// Replace the PhaseForm component in learning-templates-page.tsx

// REPLACE the PhaseForm component in learning-templates-page.tsx
// AI Capabilities changed to radio buttons (select only ONE capability)

const PhaseForm = ({ 
  phase, 
  onSave, 
  onCancel 
}: { 
  phase: Phase | null, 
  onSave: (phase: Partial<Phase>) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState<{
    title: string,
    description: string,
    icon: string,
    color: string,
    backgroundColor: string,
    aiContentGeneration?: {
      enabled: boolean,
      capabilities: string[],  // Will only have ONE capability now
      basePrompt: string
    } | null
  }>({
    title: phase?.title || '',
    description: phase?.description || '',
    icon: phase?.icon || 'brain',
    color: phase?.color || 'rgba(98, 102, 241, 1)',
    backgroundColor: phase?.backgroundColor || 'rgba(98, 102, 241, 0.1)',
    aiContentGeneration: phase?.aiContentGeneration || null
  });
  
  const updateBackgroundColor = (color: string) => {
    const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*\d+(?:\.\d+)?)?\)/);
    if (rgba) {
      const [, r, g, b] = rgba;
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'rgba(98, 102, 241, 0.1)';
  };
  
  const handleColorChange = (color: string) => {
    setFormData({
      ...formData,
      color,
      backgroundColor: updateBackgroundColor(color)
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedPhase: Partial<Phase> = {
      ...phase,
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      color: formData.color,
      backgroundColor: formData.backgroundColor,
      aiContentGeneration: formData.aiContentGeneration
    };
    
    onSave(updatedPhase);
  };
  
  // Get currently selected capability (only one)
  const selectedCapability = formData.aiContentGeneration?.capabilities?.[0] || null;
  
  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">
            <Settings className="h-4 w-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Content
          </TabsTrigger>
        </TabsList>

        {/* BASIC INFO TAB - UNCHANGED */}
        <TabsContent value="basic" className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Phase Title</div>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Understanding"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Description</div>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this phase"
            />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Icon</div>
            <Select
              value={formData.icon}
              onValueChange={(value) => setFormData({ ...formData, icon: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brain">Brain</SelectItem>
                <SelectItem value="lightbulb">Lightbulb</SelectItem>
                <SelectItem value="check-circle">Check Circle</SelectItem>
                <SelectItem value="magnify">Magnify</SelectItem>
                <SelectItem value="eye">Eye</SelectItem>
                <SelectItem value="text-box-edit">Text Edit</SelectItem>
                <SelectItem value="thought-bubble">Thought Bubble</SelectItem>
                <SelectItem value="fast-forward">Fast Forward</SelectItem>
                <SelectItem value="book-open-variant">Book</SelectItem>
                <SelectItem value="play-circle">Play</SelectItem>
                <SelectItem value="clipboard-text">Clipboard</SelectItem>
                <SelectItem value="note-text">Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Color</div>
            <ColorPicker
              color={formData.color}
              onChange={handleColorChange}
            />
          </div>
        </TabsContent>

        {/* AI CONTENT TAB - CHANGED TO RADIO BUTTONS */}
        <TabsContent value="ai" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI Content Generation</CardTitle>
              <CardDescription className="text-xs">
                Configure AI features for this phase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <div>
                  <div className="text-sm font-medium">Enable AI Generation</div>
                  <p className="text-xs text-muted-foreground">
                    Toggle AI features for this phase
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.aiContentGeneration?.enabled || false}
                  onChange={(e) => {
                    if (e.target.checked && !formData.aiContentGeneration) {
                      setFormData({
                        ...formData,
                        aiContentGeneration: {
                          enabled: true,
                          capabilities: ['generate_summaries'], // Default to first one
                          basePrompt: 'You are an educational expert helping students with this learning phase.'
                        }
                      });
                    } else if (formData.aiContentGeneration) {
                      setFormData({
                        ...formData,
                        aiContentGeneration: {
                          ...formData.aiContentGeneration,
                          enabled: e.target.checked
                        }
                      });
                    }
                  }}
                  className="h-4 w-4"
                />
              </div>

              {/* AI Configuration (only show if enabled) */}
              {formData.aiContentGeneration?.enabled && (
                <>
                  <div>
                    <label className="text-sm font-medium">Base AI Prompt</label>
                    <Textarea
                      value={formData.aiContentGeneration.basePrompt}
                      onChange={(e) => setFormData({
                        ...formData,
                        aiContentGeneration: {
                          ...formData.aiContentGeneration!,
                          basePrompt: e.target.value
                        }
                      })}
                      placeholder="Base instructions for AI content generation"
                      rows={4}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be combined with template complexity prompts
                    </p>
                  </div>

                  {/* CHANGED: Radio buttons instead of checkboxes */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">AI Capability (Select ONE)</label>
                    <div className="space-y-2">
                      {[
                        { id: 'generate_summaries', label: 'Generate Summaries' },
                        { id: 'create_practice_questions', label: 'Create Practice Questions' },
                        { id: 'identify_key_concepts', label: 'Identify Key Concepts' },
                        { id: 'create_flashcards', label: 'Create Flashcards' },
                        { id: 'explain_concepts', label: 'Explain Concepts' },
                        { id: 'provide_examples', label: 'Provide Examples' }
                      ].map((capability) => (
                        <div key={capability.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={capability.id}
                            name="ai-capability"
                            checked={selectedCapability === capability.id}
                            onChange={() => {
                              setFormData({
                                ...formData,
                                aiContentGeneration: {
                                  ...formData.aiContentGeneration!,
                                  capabilities: [capability.id] // Only one capability
                                }
                              });
                            }}
                            className="h-4 w-4"
                          />
                          <label htmlFor={capability.id} className="text-sm cursor-pointer">
                            {capability.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <DialogFooter className="mt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};

// Metric Form Component
const MetricForm = ({ 
  metric, 
  onSave, 
  onCancel 
}: { 
  metric: Metric | null, 
  onSave: (metric: Partial<Metric>) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState<{
    name: string,
    description: string,
    type: 'percentage' | 'time' | 'count' | 'rating' | 'text',
    defaultValue?: number | string,
    min?: number,
    max?: number
  }>({
    name: metric?.name || '',
    description: metric?.description || '',
    type: metric?.type || 'count',
    defaultValue: metric?.defaultValue,
    min: metric?.min,
    max: metric?.max
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a new metric or update existing one
    const updatedMetric: Partial<Metric> = {
      ...metric,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      defaultValue: formData.defaultValue,
      min: formData.min,
      max: formData.max
    };
    
    onSave(updatedMetric);
  };
  
  const showRangeFields = formData.type === 'percentage' || formData.type === 'rating';
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Metric Name</div>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Time Spent"
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Description</div>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this metric"
          />
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Metric Type</div>
          <Select
            value={formData.type}
            onValueChange={(value: any) => setFormData({ 
              ...formData, 
              type: value,
              // Reset min/max if changing to a type that doesn't use them
              min: ['percentage', 'rating'].includes(value) ? formData.min : undefined,
              max: ['percentage', 'rating'].includes(value) ? formData.max : undefined,
              // Reset default value if changing to text type
              defaultValue: value === 'text' ? undefined : formData.defaultValue
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {metricTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {formData.type !== 'text' && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Default Value</div>
              <Input
                type="number"
                value={formData.defaultValue !== undefined ? formData.defaultValue.toString() : ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  defaultValue: e.target.value === '' ? undefined : Number(e.target.value)
                })}
                placeholder="e.g., 0"
              />
            </div>
          )}
          
          {showRangeFields && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Minimum Value</div>
                <Input
                  type="number"
                  value={formData.min !== undefined ? formData.min.toString() : ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    min: e.target.value === '' ? undefined : Number(e.target.value)
                  })}
                  placeholder={formData.type === 'percentage' ? "0" : "1"}
                />
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Maximum Value</div>
                <Input
                  type="number"
                  value={formData.max !== undefined ? formData.max.toString() : ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    max: e.target.value === '' ? undefined : Number(e.target.value)
                  })}
                  placeholder={formData.type === 'percentage' ? "100" : "5"}
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    );
  };
  
  // Main component
  export default function LearningTemplatesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [activePhase, setActivePhase] = useState<Phase | null>(null);
    const [activeMetric, setActiveMetric] = useState<Metric | null>(null);

    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

    
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
    const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false);
    const [isMetricDialogOpen, setIsMetricDialogOpen] = useState(false);
    const [isMetricsManagerOpen, setIsMetricsManagerOpen] = useState(false);
    
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    
    // Fetch templates with React Query
    const { data: templates = [], isLoading, error } = useTemplates();
    const { mutate: createTemplate } = useCreateTemplate();
    const { mutate: updateTemplate } = useUpdateTemplate();
    const { mutate: deleteTemplate } = useDeleteTemplate();
  
    // Filter templates based on search query
    const filteredTemplates = templates.filter(template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    // Handle tag filtering
    const handleTagClick = (tag: string) => {
      if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter(t => t !== tag));
      } else {
        setSelectedTags([...selectedTags, tag]);
      }
    };
  
    // Helper function to get template tags
// Helper function to get template tags - FIXED
const getTemplateTags = (templateId: string): string[] => {
  const template = templates.find(t => t.id === templateId);
  if (!template) return ['Custom'];
  
  // Check templateCategory field from database
  if (template.templateCategory) {
    switch (template.templateCategory) {
      case 'problem-solving':
        return ['Problem Solving'];
      case 'reading':
        return ['Reading'];
      case 'lecture':
        return ['Lecture'];
      default:
        return ['Custom'];
    }
  }
  
  // Fallback to icon if no category
  switch (template.icon) {
    case 'math-compass':
      return ['Problem Solving'];
    case 'book-open-page-variant':
      return ['Reading'];
    case 'video':
      return ['Lecture'];
    default:
      return ['Custom'];
  }
};
  
    // Filter templates by tags
    const filteredByTagsTemplates = selectedTags.length > 0
      ? filteredTemplates.filter(template => {
          const templateTags = getTemplateTags(template.id);
          return selectedTags.some(tag => templateTags.includes(tag));
        })
      : filteredTemplates;
  
    // Handle template operations
    const handleAddTemplate = () => {
      setDialogMode('add');
      setIsTemplateDialogOpen(true);
    };
  
    const handleEditTemplate = (template: Template) => {
      setSelectedTemplateId(template.id); 
      setDialogMode('edit');
      setIsTemplateDialogOpen(true);
    };
  
    const handleSaveTemplate = (templateData: Partial<Template>) => {
      if (dialogMode === 'add') {
        createTemplate(templateData);
      } else {
        if (templateData.id) {
          updateTemplate({ id: templateData.id, template: templateData });
        }
      }
      setIsTemplateDialogOpen(false);
    };
  
    const handleDeleteTemplate = (templateId: string) => {
      if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
        deleteTemplate(templateId);
      }
    };
  
    const handleManageOptions = (templateId: string) => {
      setSelectedTemplateId(templateId);
    };
  
    // Handle option operations
    const handleAddOption = () => {
      setDialogMode('add');
      setIsOptionDialogOpen(true);
    };
  
    const handleEditOption = (option: Option) => {
      setDialogMode('edit');
      setIsOptionDialogOpen(true);
    };
  
    const handleSaveOption = (optionData: Partial<Option>) => {
      if (!selectedTemplateId) return;
      
      const currentTemplate = templates.find(t => t.id === selectedTemplateId);
      if (!currentTemplate) return;
      
      if (dialogMode === 'add') {
        // Add new option to template
        const newOption: Option = {
          id: `temp-${Date.now()}`, // Temporary ID, will be replaced by server
          name: optionData.name || 'New Option',
          description: optionData.description || '',
          phases: []
        };
        
        updateTemplate({
          id: selectedTemplateId,
          template: {
            ...currentTemplate,
            options: [...currentTemplate.options, newOption]
          }
        });
      } else {
        // Update existing option
        if (optionData.id) {
          const updatedOptions = currentTemplate.options.map(o => 
            o.id === optionData.id ? { ...o, ...optionData } : o
          );
          
          updateTemplate({
            id: selectedTemplateId,
            template: {
              ...currentTemplate,
              options: updatedOptions
            }
          });
        }
      }
      
      setIsOptionDialogOpen(false);
    };
  
    const handleDeleteOption = (optionId: string) => {
      if (!selectedTemplateId || !confirm('Are you sure you want to delete this option? This action cannot be undone.')) {
        return;
      }
      
      const currentTemplate = templates.find(t => t.id === selectedTemplateId);
      if (!currentTemplate) return;
      
      // Remove the option from the template
      updateTemplate({
        id: selectedTemplateId,
        template: {
          ...currentTemplate,
          options: currentTemplate.options.filter(o => o.id !== optionId)
        }
      });
    };
  
    // Handle phase operations
    const handleAddPhase = (optionId: string) => {
      setSelectedOptionId(optionId);
      setDialogMode('add');
      setIsPhaseDialogOpen(true);
    };
  
    const handleEditPhase = (phase: Phase) => {
      // Find which option contains this phase
      if (selectedTemplateId) {
        const currentTemplate = templates.find(t => t.id === selectedTemplateId);
        if (currentTemplate) {
          for (const option of currentTemplate.options) {
            if (option.phases.some(p => p.id === phase.id)) {
              setSelectedOptionId(option.id);
              break;
            }
          }
        }
      }
      setActivePhase(phase);
      setDialogMode('edit');
      setIsPhaseDialogOpen(true);
    };
  
// REPLACE handleSavePhase function in learning-templates-page.tsx

const handleSavePhase = (phaseData: Partial<Phase>) => {
  if (!selectedTemplateId) return;
  
  const currentTemplate = templates.find(t => t.id === selectedTemplateId);
  if (!currentTemplate) return;
  
  // For edit mode, find which option contains the phase
  let targetOptionId = selectedOptionId;
  
  if (dialogMode === 'edit' && phaseData.id && !targetOptionId) {
    // Find the option that contains this phase
    for (const option of currentTemplate.options) {
      if (option.phases.some(p => p.id === phaseData.id)) {
        targetOptionId = option.id;
        break;
      }
    }
  }
  
  if (!targetOptionId) {
    console.error('Could not find option for phase');
    return;
  }
  
  const currentOption = currentTemplate.options.find(o => o.id === targetOptionId);
  if (!currentOption) return;
  
  if (dialogMode === 'add') {
    // Add new phase to option
    const newPhase: Phase = {
      id: `temp-${Date.now()}`,
      title: phaseData.title || 'New Phase',
      description: phaseData.description || '',
      icon: phaseData.icon || 'brain',
      color: phaseData.color || 'rgba(98, 102, 241, 1)',
      backgroundColor: phaseData.backgroundColor || 'rgba(98, 102, 241, 0.1)',
      aiContentGeneration: phaseData.aiContentGeneration || null, // IMPORTANT: Include AI config
      metrics: []
    };
    
    const updatedOptions = currentTemplate.options.map(o => {
      if (o.id === targetOptionId) {
        return {
          ...o,
          phases: [...o.phases, newPhase]
        };
      }
      return o;
    });
    
    updateTemplate({
      id: selectedTemplateId,
      template: {
        ...currentTemplate,
        options: updatedOptions
      }
    });
  } else {
    // Update existing phase
    if (phaseData.id && activePhase) {
      const updatedOptions = currentTemplate.options.map(o => {
        if (o.id === targetOptionId) {
          return {
            ...o,
            phases: o.phases.map(p => 
              p.id === phaseData.id 
                ? { 
                    ...p, 
                    ...phaseData, 
                    metrics: p.metrics,
                    aiContentGeneration: phaseData.aiContentGeneration // IMPORTANT: Preserve AI config
                  } 
                : p
            )
          };
        }
        return o;
      });
      
      console.log('[handleSavePhase] Updating phase with AI config:', phaseData.aiContentGeneration);
      
      updateTemplate({
        id: selectedTemplateId,
        template: {
          ...currentTemplate,
          options: updatedOptions
        }
      });
    }
  }
  
  setIsPhaseDialogOpen(false);
  setActivePhase(null);
  setSelectedOptionId(null);
};
  
    const handleDeletePhase = (phaseId: string) => {
      if (!selectedTemplateId || !confirm('Are you sure you want to delete this phase? This action cannot be undone.')) {
        return;
      }
      
      const currentTemplate = templates.find(t => t.id === selectedTemplateId);
      if (!currentTemplate) return;
      
      // Find the option that contains the phase
      let targetOptionId = '';
      for (const option of currentTemplate.options) {
        if (option.phases.some(p => p.id === phaseId)) {
          targetOptionId = option.id;
          break;
        }
      }
      
      if (!targetOptionId) return;
      
      // Remove the phase from the option
      const updatedOptions = currentTemplate.options.map(o => {
        if (o.id === targetOptionId) {
          return {
            ...o,
            phases: o.phases.filter(p => p.id !== phaseId)
          };
        }
        return o;
      });
      
      updateTemplate({
        id: selectedTemplateId,
        template: {
          ...currentTemplate,
          options: updatedOptions
        }
      });
    };
  
    // Handle metric operations
    const handleManageMetrics = (phase: Phase) => {
      setActivePhase(phase);
      setIsMetricsManagerOpen(true);
    };
  
    const handleAddMetric = () => {
      setActiveMetric(null);
      setDialogMode('add');
      setIsMetricDialogOpen(true);
    };
  
    const handleEditMetric = (metric: Metric) => {
      setActiveMetric(metric);
      setDialogMode('edit');
      setIsMetricDialogOpen(true);
    };
  
    const handleSaveMetric = (metricData: Partial<Metric>) => {
      if (!selectedTemplateId || !activePhase) return;
      
      const currentTemplate = templates.find(t => t.id === selectedTemplateId);
      if (!currentTemplate) return;
      
      // Find the option that contains the phase
      let targetOption = null;
      for (const option of currentTemplate.options) {
        const phase = option.phases.find(p => p.id === activePhase.id);
        if (phase) {
          targetOption = option;
          break;
        }
      }
      
      if (!targetOption) return;
      
      if (dialogMode === 'add') {
        // Add new metric to phase
        const newMetric: Metric = {
          id: `temp-${Date.now()}`, // Temporary ID, will be replaced by server
          name: metricData.name || 'New Metric',
          description: metricData.description || '',
          type: metricData.type || 'count',
          defaultValue: metricData.defaultValue,
          min: metricData.min,
          max: metricData.max
        };
        
        const updatedOptions = currentTemplate.options.map(o => {
          if (o.id === targetOption!.id) {
            return {
              ...o,
              phases: o.phases.map(p => {
                if (p.id === activePhase.id) {
                  return {
                    ...p,
                    metrics: [...p.metrics, newMetric]
                  };
                }
                return p;
              })
            };
          }
          return o;
        });
        
        updateTemplate({
          id: selectedTemplateId,
          template: {
            ...currentTemplate,
            options: updatedOptions
          }
        });
      } else {
        // Update existing metric
        if (metricData.id && activeMetric) {
          const updatedOptions = currentTemplate.options.map(o => {
            if (o.id === targetOption!.id) {
              return {
                ...o,
                phases: o.phases.map(p => {
                  if (p.id === activePhase.id) {
                    return {
                      ...p,
                      metrics: p.metrics.map(m => 
                        m.id === metricData.id ? { ...m, ...metricData } : m
                      )
                    };
                  }
                  return p;
                })
              };
            }
            return o;
          });
          
          updateTemplate({
            id: selectedTemplateId,
            template: {
              ...currentTemplate,
              options: updatedOptions
            }
          });
        }
      }
      
      setIsMetricDialogOpen(false);
      setActiveMetric(null);
    };
  
    const handleDeleteMetric = (metricId: string) => {
      if (!selectedTemplateId || !activePhase || !confirm('Are you sure you want to delete this metric? This action cannot be undone.')) {
        return;
      }
      
      const currentTemplate = templates.find(t => t.id === selectedTemplateId);
      if (!currentTemplate) return;
      
      // Find the option that contains the phase
      let targetOption = null;
      for (const option of currentTemplate.options) {
        const phase = option.phases.find(p => p.id === activePhase.id);
        if (phase) {
          targetOption = option;
          break;
        }
      }
      
      if (!targetOption) return;
      
      // Remove the metric from the phase
      const updatedOptions = currentTemplate.options.map(o => {
        if (o.id === targetOption!.id) {
          return {
            ...o,
            phases: o.phases.map(p => {
              if (p.id === activePhase.id) {
                return {
                  ...p,
                  metrics: p.metrics.filter(m => m.id !== metricId)
                };
              }
              return p;
            })
          };
        }
        return o;
      });
      
      updateTemplate({
        id: selectedTemplateId,
        template: {
          ...currentTemplate,
          options: updatedOptions
        }
      });
    };
  
    // Get current template
    const currentTemplate = selectedTemplateId 
      ? templates.find(t => t.id === selectedTemplateId) 
      : null;
  
return (
  <div className="w-full px-2 py-4">
    {/* COMPLETE HEADER */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Templates</h1>
        <p className="text-muted-foreground">
          Manage and customize learning templates for different learning activities
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
        <Button onClick={handleAddTemplate}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>
    </div>
    
    {/* SEARCH */}
    <div className="mb-6">
      <Input
        placeholder="Search templates..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />
    </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin mr-2">
              <ChevronsUpDown className="h-5 w-5" />
            </div>
            <p>Loading templates...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-destructive">
            <p>Error loading templates. Please try again.</p>
          </div>
        ) : (
          <>
            {!selectedTemplateId ? (
              // Enhanced Templates landing view
              <>
                <div className="mb-4">
                  <div className="flex flex-col md:flex-row gap-4 bg-muted/40 p-3 rounded-lg border">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Learning templates provide structured approaches to different types of learning activities.
                        Each template offers multiple approaches with customizable phases and metrics.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <div className="text-xs font-medium mr-1 flex items-center">Filter:</div>
                        {['Problem Solving', 'Reading', 'Lecture', 'Custom'].map((tag) => (
                          <Badge 
                            key={tag}
                            variant={selectedTags.includes(tag) ? 
                              (tag === 'Problem Solving' ? 'indigo' : 
                               tag === 'Reading' ? 'cyan' : 
                               tag === 'Lecture' ? 'orange' : 'outline') : 
                              'outline'}
                            className={cn(
                              "cursor-pointer text-xs py-0.5 px-2",
                              selectedTags.includes(tag) ? "" : "bg-background hover:bg-background/80"
                            )}
                            onClick={() => handleTagClick(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {selectedTags.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedTags([])}
                            className="text-xs h-5 px-2 ml-1"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col gap-1 flex-shrink-0 md:w-48">
                      <div className="text-xs font-medium mb-1">Template Statistics</div>
                      <div className="grid grid-cols-4 md:grid-cols-2 gap-1.5 flex-1">
                        <div className="bg-background p-1.5 rounded border text-center">
                          <div className="text-lg font-bold">{templates.length}</div>
                          <div className="text-xs text-muted-foreground">Templates</div>
                        </div>
                        <div className="bg-background p-1.5 rounded border text-center">
                          <div className="text-lg font-bold">
                            {templates.reduce((sum, t) => sum + t.options.length, 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Approaches</div>
                        </div>
                        <div className="bg-background p-1.5 rounded border text-center">
                          <div className="text-lg font-bold">
                            {templates.reduce((sum, t) => 
                              sum + t.options.reduce((s, o) => s + o.phases.length, 0), 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Phases</div>
                        </div>
                        <div className="bg-background p-1.5 rounded border text-center">
                          <div className="text-lg font-bold">
                            {templates.reduce((sum, t) => 
                              sum + t.options.reduce((s, o) => 
                                s + o.phases.reduce((p, phase) => p + phase.metrics.length, 0), 0), 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Metrics</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredByTagsTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={handleEditTemplate}
                      onDelete={handleDeleteTemplate}
                      onManageOptions={handleManageOptions}
                    />
                  ))}
                  
                  {filteredByTagsTemplates.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      {selectedTags.length > 0 ? (
                        <>
                          <p className="text-muted-foreground">No templates match the selected filters.</p>
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedTags([])} 
                            className="mt-3"
                          >
                            Clear Filters
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-muted-foreground">No templates found.</p>
                          <Button onClick={handleAddTemplate} className="mt-3">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add New Template
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Template details view
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <Button variant="outline" onClick={() => setSelectedTemplateId(null)}>
                    Back to Templates
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {currentTemplate?.name} - Options
                  </h2>
                </div>
                
                <div className="mb-6">
                  <Button onClick={handleAddOption}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                
                {currentTemplate && (
                  <Accordion type="single" collapsible className="space-y-4">
                    {currentTemplate.options.map((option) => (
                      <OptionAccordion
                        key={option.id}
                        option={option}
                        templateId={currentTemplate.id}
                        onEdit={handleEditOption}
                        onDelete={handleDeleteOption}
                        onAddPhase={handleAddPhase}
                        onEditPhase={handleEditPhase}
                        onDeletePhase={handleDeletePhase}
                        onEditMetrics={handleManageMetrics}
                      />
                    ))}
                  </Accordion>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Template Dialog */}
{/* Template Dialog */}
<Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
  <DialogContent className="max-w-3xl">  {/* CHANGE THIS - make it wider */}
    <DialogHeader>
      <DialogTitle>
        {dialogMode === 'add' ? 'Add New Template' : 'Edit Template'}
      </DialogTitle>
      <DialogDescription>
        Create or modify a learning template
      </DialogDescription>
    </DialogHeader>
    
    <TemplateForm
      template={dialogMode === 'edit' ? templates.find(t => t.id === selectedTemplateId) || null : null}
      onSave={handleSaveTemplate}
      onCancel={() => setIsTemplateDialogOpen(false)}
    />
  </DialogContent>
</Dialog>
        
        {/* Option Dialog */}
        <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'add' ? 'Add New Option' : 'Edit Option'}
              </DialogTitle>
              <DialogDescription>
                Create or modify a learning option
              </DialogDescription>
            </DialogHeader>
            
            <OptionForm
              option={dialogMode === 'edit' && currentTemplate 
                ? currentTemplate.options.find(o => o.id === selectedOptionId) || null 
                : null}
              onSave={handleSaveOption}
              onCancel={() => setIsOptionDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        {/* Phase Dialog */}
        <Dialog open={isPhaseDialogOpen} onOpenChange={setIsPhaseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'add' ? 'Add New Phase' : 'Edit Phase'}
              </DialogTitle>
              <DialogDescription>
                Create or modify a learning phase
              </DialogDescription>
            </DialogHeader>
            
            <PhaseForm
              phase={activePhase}
              onSave={handleSavePhase}
              onCancel={() => setIsPhaseDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        {/* Metrics Manager Dialog */}
        <Dialog open={isMetricsManagerOpen} onOpenChange={setIsMetricsManagerOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Manage Metrics for {activePhase?.title}
              </DialogTitle>
              <DialogDescription>
                Add, edit, or remove metrics for this phase
              </DialogDescription>
            </DialogHeader>
            
            {activePhase && (
              <div className="space-y-4">
                <Button onClick={handleAddMetric}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Metric
                </Button>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activePhase.metrics.map((metric) => (
                    <PhaseMetricItem
                      key={metric.id}
                      metric={metric}
                      onEdit={handleEditMetric}
                      onDelete={handleDeleteMetric}
                    />
                  ))}
                  
                  {activePhase.metrics.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No metrics defined for this phase.</p>
                      <Button onClick={handleAddMetric} className="mt-2">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Metric
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMetricsManagerOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Metric Dialog */}
        <Dialog open={isMetricDialogOpen} onOpenChange={setIsMetricDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'add' ? 'Add New Metric' : 'Edit Metric'}
              </DialogTitle>
              <DialogDescription>
                Create or modify a phase metric
              </DialogDescription>
            </DialogHeader>
            
            <MetricForm
              metric={activeMetric}
              onSave={handleSaveMetric}
              onCancel={() => setIsMetricDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        <BulkUploadDialog 
  open={isBulkUploadOpen} 
  onOpenChange={setIsBulkUploadOpen} 
/>
      </div>
    );
  }