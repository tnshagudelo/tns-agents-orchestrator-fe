export type ProjectMode = 'new' | 'existing' | 'migration';

export type TechId = 'angular' | 'react' | 'vue' | 'nestjs'
                   | 'express' | 'nextjs' | 'fastapi' | 'django';

export type StepTag = 'transversal' | 'tech-specific';

export interface Technology {
  id: TechId;
  name: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  stack: string;
  packageManager: 'npm' | 'pip';
  commands: Record<string, string>;
  conventions: string[];
  restrictions: string[];
}

export interface Step {
  id: string;
  title: string;
  description: string;
  command?: string;
  tag: StepTag;
}

export interface PromptTemplate {
  id: string;
  label: string;
  text: string;
}

export interface ModeOption {
  mode: ProjectMode;
  title: string;
  description: string;
  icon: string;
}

export interface FrameworkState {
  mode: ProjectMode | null;
  techId: TechId | null;
  activeTab: 'steps' | 'prompts' | 'claudemd' | 'conventions';
  checkedSteps: Record<string, boolean>;
}
