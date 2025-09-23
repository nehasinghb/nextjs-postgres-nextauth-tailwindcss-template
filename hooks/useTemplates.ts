// hooks/useTemplates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types
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
  createdBy?: string;
  options: Option[];
}

// Update base path to use /admin/api instead of /api
const API_BASE = '/admin/api';

// API helper functions - updated to use admin API path
async function fetchTemplates(includeInactive = false) {
  const { data } = await axios.get(`${API_BASE}/learning-templates`, {
    params: { includeInactive }
  });
  return data;
}

async function fetchTemplateById(id: string) {
  const { data } = await axios.get(`${API_BASE}/learning-templates/${id}`);
  return data;
}

async function createTemplate(template: Partial<Template>) {
  const { data } = await axios.post(`${API_BASE}/learning-templates`, template);
  return data;
}

async function updateTemplate(id: string, template: Partial<Template>) {
  const { data } = await axios.put(`${API_BASE}/learning-templates/${id}`, template);
  return data;
}

async function deleteTemplate(id: string) {
  const { data } = await axios.delete(`${API_BASE}/learning-templates/${id}`);
  return data;
}

// React Query hooks
export function useTemplates(includeInactive = false) {
  return useQuery({
    queryKey: ['templates', { includeInactive }],
    queryFn: () => fetchTemplates(includeInactive),
  });
}

export function useTemplate(id: string | null) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => fetchTemplateById(id!),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, template }: { id: string; template: Partial<Template> }) => 
      updateTemplate(id, template),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', data.id] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}