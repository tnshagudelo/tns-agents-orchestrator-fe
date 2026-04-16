import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

interface InceptionStep {
  icon: string;
  titleKey: string;
  descKey: string;
}

interface Phase {
  number: string;
  titleKey: string;
  descKey: string;
  outputKey: string;
  color: 'blue' | 'purple' | 'indigo' | 'emerald';
}

interface DeliverableRow {
  docKey: string;
  purposeKey: string;
  whenKey: string;
}

interface Ceremony {
  nameKey: string;
  whoKey: string;
  purposeKey: string;
}

interface Differentiator {
  icon: string;
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-how-we-work-page',
  standalone: true,
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './how-we-work-page.component.html',
  styles: [`
    :host { display: block; }
    .page { padding: 32px 24px; max-width: 1200px; margin: 0 auto; }

    /* ── Hero ─────────────────────────────────────────── */
    .hero {
      position: relative; text-align: center;
      padding: 56px 24px 48px; margin-bottom: 48px;
      border-radius: 16px;
      background: linear-gradient(160deg, #0d0d1a 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%);
      color: white; overflow: hidden;
    }
    .hero-glow {
      position: absolute; top: -40%; right: -20%;
      width: 500px; height: 500px; border-radius: 50%;
      background: radial-gradient(circle, rgba(218,108,207,0.2) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 14px; border-radius: 20px;
      background: rgba(218,108,207,0.15); border: 1px solid rgba(218,108,207,0.3);
      color: #e8a0e0; font-size: 0.68rem; font-weight: 600;
      letter-spacing: 0.5px; margin-bottom: 22px;
    }
    .hero-badge mat-icon { font-size: 13px; width: 13px; height: 13px; }
    .hero h1 {
      margin: 0 0 16px; font-size: 2.4rem; font-weight: 800;
      background: linear-gradient(135deg, #fff 30%, #da6ccf 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-lead {
      margin: 0 auto; max-width: 680px;
      font-size: 0.95rem; line-height: 1.7;
      color: rgba(255,255,255,0.7);
    }

    /* ── Section base ─────────────────────────────────── */
    .section { margin-bottom: 56px; }
    .section-header { margin-bottom: 24px; }
    .section-eyebrow {
      display: inline-block; padding: 3px 10px;
      font-size: 0.68rem; font-weight: 700; letter-spacing: 0.6px;
      text-transform: uppercase; color: #7c3aed;
      background: #f3e8ff; border-radius: 10px;
      margin-bottom: 10px;
    }
    .section-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 1.4rem; font-weight: 700; margin: 0 0 10px; color: #1a1a2e;
    }
    .section-title mat-icon { color: #3f51b5; font-size: 24px; width: 24px; height: 24px; }
    .section-desc {
      font-size: 0.9rem; color: rgba(0,0,0,0.55); line-height: 1.7;
      margin: 0; max-width: 780px;
    }

    /* ── Inception flow ───────────────────────────────── */
    .inception-flow {
      padding: 28px 24px; border-radius: 14px;
      background: linear-gradient(180deg, #faf7ff 0%, #f8f7ff 100%);
      border: 1px solid #e8e4f3;
    }
    .inception-steps {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px; margin-bottom: 20px;
    }
    .inception-step {
      display: flex; flex-direction: column; gap: 8px;
      padding: 16px 14px; border-radius: 10px;
      background: white; border: 1px solid #e5e7eb;
      text-align: center;
    }
    .inception-step-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg, #da6ccf, #7c3aed);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto;
    }
    .inception-step-icon mat-icon { color: white; font-size: 20px; width: 20px; height: 20px; }
    .inception-step h4 {
      margin: 4px 0 2px; font-size: 0.82rem; font-weight: 600; color: #1a1a2e;
    }
    .inception-step p {
      margin: 0; font-size: 0.7rem; color: rgba(0,0,0,0.5); line-height: 1.45;
    }
    .inception-outputs {
      padding: 16px 18px; border-radius: 10px;
      background: white; border: 1px dashed #c7bfe0;
    }
    .inception-outputs h4 {
      margin: 0 0 10px; font-size: 0.82rem; font-weight: 600; color: #1a1a2e;
      display: flex; align-items: center; gap: 6px;
    }
    .inception-outputs h4 mat-icon { color: #7c3aed; font-size: 16px; width: 16px; height: 16px; }
    .inception-outputs ul {
      margin: 0; padding-left: 20px; columns: 2; column-gap: 24px;
    }
    .inception-outputs li {
      font-size: 0.76rem; color: rgba(0,0,0,0.6); line-height: 1.7;
      break-inside: avoid;
    }

    /* ── Phases ───────────────────────────────────────── */
    .phases {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 14px;
    }
    .phase {
      padding: 20px; border-radius: 12px;
      background: white; border: 1px solid #e5e7eb;
      position: relative;
    }
    .phase-number {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 8px;
      font-weight: 700; font-size: 0.85rem; color: white;
      margin-bottom: 12px;
    }
    .phase--blue .phase-number { background: #3f51b5; }
    .phase--purple .phase-number { background: #7c3aed; }
    .phase--indigo .phase-number { background: #4f46e5; }
    .phase--emerald .phase-number { background: #059669; }
    .phase h4 {
      margin: 0 0 6px; font-size: 0.95rem; font-weight: 600; color: #1a1a2e;
    }
    .phase-desc {
      margin: 0 0 12px; font-size: 0.78rem;
      color: rgba(0,0,0,0.55); line-height: 1.55;
    }
    .phase-output {
      display: flex; gap: 6px; align-items: flex-start;
      padding: 8px 10px; border-radius: 8px;
      background: #f8f7ff; border: 1px solid #e8e4f3;
    }
    .phase-output mat-icon { color: #7c3aed; font-size: 16px; width: 16px; height: 16px; min-width: 16px; flex-shrink: 0; margin-top: 1px; }
    .phase-output span { font-size: 0.72rem; color: rgba(0,0,0,0.65); line-height: 1.45; }

    /* ── Tables ───────────────────────────────────────── */
    .table-wrap {
      border-radius: 12px; overflow: hidden;
      border: 1px solid #e5e7eb; background: white;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td {
      padding: 12px 16px; text-align: left; font-size: 0.8rem;
      border-bottom: 1px solid #f1f5f9;
    }
    th {
      background: #f8fafc; font-weight: 600; color: #1a1a2e;
      font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.4px;
    }
    td { color: rgba(0,0,0,0.65); line-height: 1.5; }
    td:first-child { font-weight: 600; color: #1a1a2e; }
    tr:last-child td { border-bottom: none; }

    /* ── Differentiators ──────────────────────────────── */
    .differentiators {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 14px;
    }
    .diff-card {
      padding: 20px; border-radius: 12px;
      background: linear-gradient(180deg, #ffffff 0%, #faf7ff 100%);
      border: 1px solid #e8e4f3;
    }
    .diff-card mat-icon {
      color: #da6ccf; font-size: 28px; width: 28px; height: 28px;
      margin-bottom: 8px;
    }
    .diff-card h4 {
      margin: 0 0 6px; font-size: 0.92rem; font-weight: 600; color: #1a1a2e;
    }
    .diff-card p {
      margin: 0; font-size: 0.78rem; color: rgba(0,0,0,0.55); line-height: 1.55;
    }

    /* ── End / Quality ────────────────────────────────── */
    .quality-list {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 10px;
    }
    .quality-item {
      display: flex; gap: 10px; align-items: flex-start;
      padding: 12px 16px; border-radius: 10px;
      background: #f0fdf4; border: 1px solid #bbf7d0;
    }
    .quality-item mat-icon {
      color: #059669; font-size: 18px; width: 18px; height: 18px;
      margin-top: 2px; flex-shrink: 0;
    }
    .quality-item span { font-size: 0.8rem; color: #14532d; line-height: 1.5; }

    /* ── End card ─────────────────────────────────────── */
    .end-card {
      padding: 24px 28px; border-radius: 14px;
      background: linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #16213e 100%);
      color: white;
    }
    .end-card h3 {
      margin: 0 0 14px; font-size: 1.1rem; font-weight: 700;
      display: flex; align-items: center; gap: 8px;
    }
    .end-card h3 mat-icon { color: #da6ccf; }
    .end-card ul { margin: 0; padding-left: 20px; }
    .end-card li {
      font-size: 0.85rem; line-height: 1.8; color: rgba(255,255,255,0.78);
    }

    /* ── Footer ───────────────────────────────────────── */
    .footer {
      margin-top: 32px; padding: 20px 24px;
      text-align: center; border-radius: 12px;
      background: #f8f7ff; border: 1px solid #e8e4f3;
    }
    .footer strong { color: #1a1a2e; font-size: 0.95rem; }
    .footer p {
      margin: 4px 0 0; font-size: 0.82rem; color: rgba(0,0,0,0.55);
    }

    @media (max-width: 640px) {
      .hero h1 { font-size: 1.7rem; }
      .inception-outputs ul { columns: 1; }
    }
  `],
})
export class HowWeWorkPageComponent {
  readonly inceptionSteps: InceptionStep[] = [
    { icon: 'psychology_alt', titleKey: 'howWeWork.inception.understandTitle', descKey: 'howWeWork.inception.understandDesc' },
    { icon: 'map', titleKey: 'howWeWork.inception.scopeTitle', descKey: 'howWeWork.inception.scopeDesc' },
    { icon: 'architecture', titleKey: 'howWeWork.inception.archTitle', descKey: 'howWeWork.inception.archDesc' },
    { icon: 'format_list_bulleted', titleKey: 'howWeWork.inception.storiesTitle', descKey: 'howWeWork.inception.storiesDesc' },
    { icon: 'route', titleKey: 'howWeWork.inception.roadmapTitle', descKey: 'howWeWork.inception.roadmapDesc' },
  ];

  readonly inceptionOutputs: string[] = [
    'howWeWork.inception.out1',
    'howWeWork.inception.out2',
    'howWeWork.inception.out3',
    'howWeWork.inception.out4',
    'howWeWork.inception.out5',
    'howWeWork.inception.out6',
  ];

  readonly phases: Phase[] = [
    { number: '1', titleKey: 'howWeWork.phases.refineTitle', descKey: 'howWeWork.phases.refineDesc', outputKey: 'howWeWork.phases.refineOutput', color: 'blue' },
    { number: '2', titleKey: 'howWeWork.phases.designTitle', descKey: 'howWeWork.phases.designDesc', outputKey: 'howWeWork.phases.designOutput', color: 'purple' },
    { number: '3', titleKey: 'howWeWork.phases.buildTitle', descKey: 'howWeWork.phases.buildDesc', outputKey: 'howWeWork.phases.buildOutput', color: 'indigo' },
    { number: '4', titleKey: 'howWeWork.phases.validateTitle', descKey: 'howWeWork.phases.validateDesc', outputKey: 'howWeWork.phases.validateOutput', color: 'emerald' },
  ];

  readonly iterationDeliverables: DeliverableRow[] = [
    { docKey: 'howWeWork.deliv.iter.specDoc', purposeKey: 'howWeWork.deliv.iter.specPurpose', whenKey: 'howWeWork.deliv.iter.specWhen' },
    { docKey: 'howWeWork.deliv.iter.adrDoc', purposeKey: 'howWeWork.deliv.iter.adrPurpose', whenKey: 'howWeWork.deliv.iter.adrWhen' },
    { docKey: 'howWeWork.deliv.iter.contractDoc', purposeKey: 'howWeWork.deliv.iter.contractPurpose', whenKey: 'howWeWork.deliv.iter.contractWhen' },
    { docKey: 'howWeWork.deliv.iter.userDoc', purposeKey: 'howWeWork.deliv.iter.userPurpose', whenKey: 'howWeWork.deliv.iter.userWhen' },
    { docKey: 'howWeWork.deliv.iter.demoDoc', purposeKey: 'howWeWork.deliv.iter.demoPurpose', whenKey: 'howWeWork.deliv.iter.demoWhen' },
  ];

  readonly finalDeliverables: { docKey: string; contentKey: string }[] = [
    { docKey: 'howWeWork.deliv.final.techDoc', contentKey: 'howWeWork.deliv.final.techContent' },
    { docKey: 'howWeWork.deliv.final.userDoc', contentKey: 'howWeWork.deliv.final.userContent' },
    { docKey: 'howWeWork.deliv.final.opsDoc', contentKey: 'howWeWork.deliv.final.opsContent' },
    { docKey: 'howWeWork.deliv.final.adrDoc', contentKey: 'howWeWork.deliv.final.adrContent' },
    { docKey: 'howWeWork.deliv.final.promptDoc', contentKey: 'howWeWork.deliv.final.promptContent' },
    { docKey: 'howWeWork.deliv.final.continuityDoc', contentKey: 'howWeWork.deliv.final.continuityContent' },
  ];

  readonly ceremonies: Ceremony[] = [
    { nameKey: 'howWeWork.cer.dailyName', whoKey: 'howWeWork.cer.dailyWho', purposeKey: 'howWeWork.cer.dailyPurpose' },
    { nameKey: 'howWeWork.cer.syncName', whoKey: 'howWeWork.cer.syncWho', purposeKey: 'howWeWork.cer.syncPurpose' },
    { nameKey: 'howWeWork.cer.refineName', whoKey: 'howWeWork.cer.refineWho', purposeKey: 'howWeWork.cer.refinePurpose' },
    { nameKey: 'howWeWork.cer.demoName', whoKey: 'howWeWork.cer.demoWho', purposeKey: 'howWeWork.cer.demoPurpose' },
    { nameKey: 'howWeWork.cer.retroName', whoKey: 'howWeWork.cer.retroWho', purposeKey: 'howWeWork.cer.retroPurpose' },
    { nameKey: 'howWeWork.cer.steeringName', whoKey: 'howWeWork.cer.steeringWho', purposeKey: 'howWeWork.cer.steeringPurpose' },
  ];

  readonly qualityItems: string[] = [
    'howWeWork.quality.ai',
    'howWeWork.quality.tests',
    'howWeWork.quality.review',
    'howWeWork.quality.envs',
    'howWeWork.quality.versioning',
    'howWeWork.quality.logs',
  ];

  readonly differentiators: Differentiator[] = [
    { icon: 'bolt', titleKey: 'howWeWork.diff.iaTitle', descKey: 'howWeWork.diff.iaDesc' },
    { icon: 'handshake', titleKey: 'howWeWork.diff.aiTitle', descKey: 'howWeWork.diff.aiDesc' },
    { icon: 'rocket_launch', titleKey: 'howWeWork.diff.valueTitle', descKey: 'howWeWork.diff.valueDesc' },
    { icon: 'groups', titleKey: 'howWeWork.diff.clientTitle', descKey: 'howWeWork.diff.clientDesc' },
    { icon: 'gavel', titleKey: 'howWeWork.diff.decisionsTitle', descKey: 'howWeWork.diff.decisionsDesc' },
    { icon: 'auto_stories', titleKey: 'howWeWork.diff.docsTitle', descKey: 'howWeWork.diff.docsDesc' },
  ];
}
