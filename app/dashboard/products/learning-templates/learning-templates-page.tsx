'use client';

import { useState } from 'react';
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
  X
} from 'lucide-react';
import Link from 'next/link';
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

// Component to display a template card
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
  const Icon = getTemplateIcon(template.icon);
  
  return (
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
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-xs font-medium">Approaches</div>
            <Badge variant="outline" className="text-xs">{template.options.length} options</Badge>
          </div>
          
          {template.options.map((option) => (
            <div key={option.id} className="rounded-md border">
              <div className="bg-muted/40 px-2 py-1.5 border-b">
                <div className="font-medium text-xs">{option.name}</div>
                <div className="text-xs text-muted-foreground truncate">{option.description}</div>
              </div>
              <div className="p-2">
                <div className="flex flex-wrap gap-1.5">
                  {option.phases.slice(0, 4).map((phase) => {
                    const PhaseIcon = getPhaseIcon(phase.icon);
                    return (
                      <div 
                        key={phase.id} 
                        className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-xs"
                        style={{ 
                          backgroundColor: phase.backgroundColor,
                          color: phase.color
                        }}
                      >
                        <PhaseIcon className="h-2.5 w-2.5" />
                        <span className="text-xs truncate max-w-28">{phase.title}</span>
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
                  {option.phases.length} phase{option.phases.length !== 1 ? 's' : ''} · 
                  {option.phases.reduce((sum, phase) => sum + phase.metrics.length, 0)} metric{option.phases.reduce((sum, phase) => sum + phase.metrics.length, 0) !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button className="w-full h-8 text-xs" onClick={() => onManageOptions(template.id)}>
          <Copy className="h-3.5 w-3.5 mr-1.5" />
          Manage Template
        </Button>
      </CardFooter>
    </Card>
  );
};

// Template Form Component
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
    isActive: boolean
  }>({
    name: template?.name || '',
    description: template?.description || '',
    icon: template?.icon || 'book-open-page-variant',
    isActive: template?.isActive !== undefined ? template.isActive : true
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a new template or update existing one
    const updatedTemplate: Partial<Template> = {
      ...template,
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      isActive: formData.isActive
    };
    
    onSave(updatedTemplate);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
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

// Option Form Component
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
    
    // Create a new option or update existing one
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

// Phase Form Component
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
    backgroundColor: string
  }>({
    title: phase?.title || '',
    description: phase?.description || '',
    icon: phase?.icon || 'brain',
    color: phase?.color || 'rgba(98, 102, 241, 1)',
    backgroundColor: phase?.backgroundColor || 'rgba(98, 102, 241, 0.1)'
  });
  
  const updateBackgroundColor = (color: string) => {
    // Extract the RGB part and create a transparent version for background
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
    
    // Create a new phase or update existing one
    const updatedPhase: Partial<Phase> = {
      ...phase,
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      color: formData.color,
      backgroundColor: formData.backgroundColor
    };
    
    onSave(updatedPhase);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
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
    const getTemplateTags = (templateId: string): string[] => {
      const template = templates.find(t => t.id === templateId);
      if (!template) return ['Custom'];
      
      if (template.name === 'Problem Solving') return ['Problem Solving'];
      if (template.name === 'Book / PDF Reading') return ['Reading'];
      if (template.name === 'Recorded Lecture') return ['Lecture'];
      return ['Custom'];
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
      setActivePhase(phase);
      setDialogMode('edit');
      setIsPhaseDialogOpen(true);
    };
  
    const handleSavePhase = (phaseData: Partial<Phase>) => {
      if (!selectedTemplateId || !selectedOptionId) return;
      
      const currentTemplate = templates.find(t => t.id === selectedTemplateId);
      if (!currentTemplate) return;
      
      const currentOption = currentTemplate.options.find(o => o.id === selectedOptionId);
      if (!currentOption) return;
      
      if (dialogMode === 'add') {
        // Add new phase to option
        const newPhase: Phase = {
          id: `temp-${Date.now()}`, // Temporary ID, will be replaced by server
          title: phaseData.title || 'New Phase',
          description: phaseData.description || '',
          icon: phaseData.icon || 'brain',
          color: phaseData.color || 'rgba(98, 102, 241, 1)',
          backgroundColor: phaseData.backgroundColor || 'rgba(98, 102, 241, 0.1)',
          metrics: []
        };
        
        const updatedOptions = currentTemplate.options.map(o => {
          if (o.id === selectedOptionId) {
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
            if (o.id === selectedOptionId) {
              return {
                ...o,
                phases: o.phases.map(p => 
                  p.id === phaseData.id ? { ...p, ...phaseData, metrics: p.metrics } : p
                )
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
      
      setIsPhaseDialogOpen(false);
      setActivePhase(null);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Learning Templates</h1>
            <p className="text-muted-foreground">
              Manage and customize learning templates for different learning activities
            </p>
          </div>
          <Button onClick={handleAddTemplate}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        </div>
        
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
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent>
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
      </div>
    );
  }