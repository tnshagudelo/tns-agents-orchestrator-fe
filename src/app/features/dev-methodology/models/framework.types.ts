export type ProjectMode = 'new' | 'existing' | 'migration' | 'multi-repo';

export type TechId = 'angular' | 'react' | 'vue' | 'nestjs'
                   | 'express' | 'nextjs' | 'fastapi' | 'django';

export type StepTag = 'context' | 'spec' | 'validate';

export type TabId = 'steps' | 'prompts' | 'claudemd' | 'specs' | 'conventions';

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
  tip?: string;
  command?: string;
  tag: StepTag;
}

export interface PromptTemplate {
  id: string;
  label: string;
  text: string;
  when: string;
}

export interface SpecFile {
  name: string;
  purpose: string;
  example: string;
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
  activeTab: TabId;
  checkedSteps: Record<string, boolean>;
}
