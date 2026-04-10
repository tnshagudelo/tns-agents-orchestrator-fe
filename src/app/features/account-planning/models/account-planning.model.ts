// ─── Enums ────────────────────────────────────────────────────────────────────

export type PlanningSessionStatus =
  | 'Queued'
  | 'QuickSearching'
  | 'QuickSearchDone'
  | 'AwaitingConfirmation'
  | 'DeepSearching'
  | 'AwaitingLinkedInInput'
  | 'AwaitingReview'
  | 'AwaitingFocus'
  | 'GeneratingPortfolio'
  | 'UnderRevision'
  | 'Approved'
  | 'Failed';

export type BackgroundJobStatus = 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';

export type ResearchSource = 'Web' | 'LinkedIn' | 'Press' | 'Rag' | 'Manual';

// ─── Client ───────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  industry: string;
  country: string;
  website?: string;
  description?: string;
  linkedInUrl?: string;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientRequest {
  name: string;
  industry: string;
  country: string;
  website?: string;
  description?: string;
  linkedInUrl?: string;
}

export interface UpdateClientRequest {
  name: string;
  industry: string;
  country: string;
  website?: string;
  description?: string;
  linkedInUrl?: string;
}

// ─── Planning Session ─────────────────────────────────────────────────────────

export interface PlanningSession {
  id: string;
  clientId: string;
  status: PlanningSessionStatus;
  conversationSessionId: string;
  userIntent?: string;
  quickSearchSummary?: string;
  focusCompanyType?: string;
  focusContactRole?: string;
  language: string;
  hasLinkedInData: boolean;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanningSessionWithJob {
  session: PlanningSession;
  jobId: string;
}

export interface SetFocusRequest {
  companyType: string;
  contactRole: string;
}

export interface RegenerateRequest {
  language?: string;
}

// ─── Background Job ───────────────────────────────────────────────────────────

export interface BackgroundJobStatus_Response {
  id: string;
  jobType: string;
  status: BackgroundJobStatus;
  progress: number;
  currentStep?: string;
  errorMessage?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// ─── Research Result ──────────────────────────────────────────────────────────

export interface ResearchResult {
  id: string;
  planningSessionId: string;
  source: ResearchSource;
  sourceName: string;
  sourceUrl: string;
  sourceDate?: Date;
  title: string;
  snippet: string;
  relevance: number;
  category: string;
  createdAt: Date;
}

// ─── Account Plan ─────────────────────────────────────────────────────────────

export interface AccountPlan {
  id: string;
  planningSessionId: string;
  version: number;
  language: string;
  content: string;
  createdAt: Date;
}

// ─── Analysis Dashboard (structured JSON from AnalysisAgent) ─────────────────

export interface AnalysisResponse {
  clientCard: AnalysisClientCard;
  stakeholders: StakeholderAnalysis[];
  opportunities: OpportunityCard[];
  swotAnalysis: SwotAnalysis;
  sectorComparison: SectorComparison;
  painValueServiceMap: PainValueService[];
  strategicProposal: StrategicProposal;
  recentNews: NewsItem[];
  sources: SourceReference[];
  internationalAlert: InternationalAlert;
  decisionStructure: DecisionStructure;
}

export interface AnalysisClientCard {
  name: string;
  industry: string;
  country: string;
  estimatedSize: string;
  summary: string;
  headquarters?: string;
  founded?: string;
  specialties?: string[];
  keyMetrics?: Record<string, string>;
}

export interface StakeholderAnalysis {
  name: string;
  role: string;
  type: string;
  relevance: string;
  painPoints: string[];
  interests: string[];
  approach: string;
  linkedinUrl?: string;
}

export interface OpportunityCard {
  title: string;
  description: string;
  horizon: string;
  matchedServices: string[];
  priority: string;
  rationale: string;
}

export interface SwotAnalysis {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

export interface SwotItem {
  title: string;
  description: string;
  source?: string;
}

export interface SectorComparison {
  position: string;
  marketShare?: string;
  competitors: string[];
  trends: string[];
  differentiators: string[];
}

export interface PainValueService {
  pain: string;
  value: string;
  service: string;
}

export interface StrategicProposal {
  title: string;
  summary: string;
  keyBenefits: string[];
  matchedServices: string[];
}

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  date?: string;
  relevance: string;
}

export interface SourceReference {
  name: string;
  url?: string;
  type: string;
  accessDate?: string;
}

export interface InternationalAlert {
  isInternational: boolean;
  languages: string[];
  recommendation?: string;
}

export interface DecisionStructure {
  model: string;
  keyInfluencers: string;
  approvalProcess: string;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export interface SessionStatusInfo {
  label: string;
  color: 'primary' | 'accent' | 'warn';
  icon: string;
  showPolling: boolean;
}

export const SESSION_STATUS_MAP: Record<PlanningSessionStatus, SessionStatusInfo> = {
  Queued:               { label: 'En cola',                color: 'primary', icon: 'hourglass_empty',   showPolling: false },
  QuickSearching:       { label: 'Búsqueda rápida...',     color: 'primary', icon: 'search',            showPolling: true },
  QuickSearchDone:      { label: 'Búsqueda rápida lista',  color: 'primary', icon: 'check_circle',      showPolling: false },
  AwaitingConfirmation: { label: 'Esperando confirmación', color: 'accent',  icon: 'help_outline',      showPolling: false },
  DeepSearching:        { label: 'Investigación profunda...', color: 'primary', icon: 'manage_search', showPolling: true },
  AwaitingLinkedInInput:{ label: 'Datos LinkedIn requeridos', color: 'warn', icon: 'person_search',     showPolling: false },
  AwaitingReview:       { label: 'Listo para revisión',    color: 'accent',  icon: 'rate_review',       showPolling: false },
  AwaitingFocus:        { label: 'Definir enfoque',        color: 'accent',  icon: 'center_focus_strong', showPolling: false },
  GeneratingPortfolio:  { label: 'Generando portafolio...', color: 'primary', icon: 'auto_awesome',    showPolling: true },
  UnderRevision:        { label: 'En revisión',            color: 'accent',  icon: 'preview',           showPolling: false },
  Approved:             { label: 'Aprobado',               color: 'primary', icon: 'verified',          showPolling: false },
  Failed:               { label: 'Error',                  color: 'warn',    icon: 'error',             showPolling: false },
};
