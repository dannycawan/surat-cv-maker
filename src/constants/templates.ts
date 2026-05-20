// src/constants/templates.ts
import { Template } from '../components/TemplateSelector';

// Job Application Letter Templates
export const JOB_APPLICATION_TEMPLATES: Template[] = [
  {
    id: 'standard',
    name: 'Standard',
    preview: require('../../assets/templates/job-standard.png'),
    description: 'Template standar untuk surat lamaran kerja professional',
  },
  {
    id: 'modern',
    name: 'Modern',
    preview: require('../../assets/templates/job-modern.png'),
    description: 'Template dengan desain modern dan clean',
  },
  {
    id: 'formal',
    name: 'Formal',
    preview: require('../../assets/templates/job-formal.png'),
    description: 'Template formal untuk perusahaan konservatif',
  },
];

// CV Templates
export const CV_TEMPLATES: Template[] = [
  {
    id: 'classic',
    name: 'Classic',
    preview: require('../../assets/templates/cv-classic.png'),
    description: 'CV sederhana dan klasik dengan format standar',
  },
  {
    id: 'professional',
    name: 'Professional',
    preview: require('../../assets/templates/cv-professional.png'),
    description: 'CV profesional dengan desain rapi',
  },
  {
    id: 'creative',
    name: 'Creative',
    preview: require('../../assets/templates/cv-creative.png'),
    description: 'CV dengan sentuhan kreatif untuk industri kreatif',
  },
];

// Resignation Letter Templates
export const RESIGNATION_TEMPLATES: Template[] = [
  {
    id: 'simple',
    name: 'Simple',
    preview: require('../../assets/templates/resignation-simple.png'),
    description: 'Template surat pengunduran diri sederhana dan langsung',
  },
  {
    id: 'respectful',
    name: 'Respectful',
    preview: require('../../assets/templates/resignation-respectful.png'),
    description: 'Template dengan penekanan pada rasa hormat dan terima kasih',
  },
  {
    id: 'detailed',
    name: 'Detailed',
    preview: require('../../assets/templates/resignation-detailed.png'),
    description: 'Template dengan ruang detail tambahan',
  },
];