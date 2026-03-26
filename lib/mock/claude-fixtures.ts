import type { ClaudePAAnalysis } from '@/types/claude.types'

export const MOCK_CLAUDE_ANALYSIS: ClaudePAAnalysis = {
  perPAActions: {
    'pa-001': {
      priority: 'APPROVED',
      priorityReason: 'PA is approved with surgery scheduled well within the authorization window.',
      immediateAction: null,
      actionDeadline: null,
      actionSteps: [
        {
          stepNumber: 1,
          step: 'Confirm pre-op appointment for March 10 with patient Maria Santos.',
          estimatedTime: '5 minutes',
        },
        {
          stepNumber: 2,
          step: 'Verify surgical facility has received authorization confirmation for March 15 procedure.',
          estimatedTime: '10 minutes',
        },
      ],
      cmsComplianceAction: null,
      statusInterpretation:
        'PA approved, 90-day surgical window through May 31. Pre-op March 10, surgery March 15. No action needed.',
      riskAssessment: {
        procedureDateRisk: false,
        cmsViolationRisk: false,
        denialRisk: false,
        appealDeadlineRisk: false,
        riskSummary: null,
      },
      recommendedDocumentation: [],
      contactPayer: false,
      contactPayerReason: null,
    },
    'pa-002': {
      priority: 'URGENT',
      priorityReason:
        'Authorization expires March 5 with MRI scheduled March 3 — only a 2-day buffer. Any scheduling delay will require a new PA submission.',
      immediateAction:
        'Confirm MRI appointment for March 3 — authorization expires March 5. Any delay requires a new PA.',
      actionDeadline: 'Before March 3',
      actionSteps: [
        {
          stepNumber: 1,
          step: 'Call imaging center to confirm Gerald Thompson MRI appointment is locked in for March 3.',
          estimatedTime: '10 minutes',
        },
        {
          stepNumber: 2,
          step: 'Contact patient to confirm attendance and provide prep instructions for brain MRI.',
          estimatedTime: '10 minutes',
        },
        {
          stepNumber: 3,
          step: 'Flag authorization expiration date of March 5 in scheduling system to prevent rescheduling past this date.',
          estimatedTime: '5 minutes',
        },
      ],
      cmsComplianceAction: null,
      statusInterpretation:
        'PA is approved but the authorization window closes March 5. The MRI is scheduled for March 3, leaving only a 2-day buffer. If the appointment is missed or rescheduled, a new PA must be submitted.',
      riskAssessment: {
        procedureDateRisk: true,
        cmsViolationRisk: false,
        denialRisk: false,
        appealDeadlineRisk: false,
        riskSummary:
          'Authorization expires in 5 days with only a 2-day buffer after the scheduled procedure date. Any delay risks requiring a full PA resubmission.',
      },
      recommendedDocumentation: [],
      contactPayer: false,
      contactPayerReason: null,
    },
    'pa-003': {
      priority: 'MONITOR',
      priorityReason:
        'PA is pending within the standard CMS 7-day response window. No action is required at this time.',
      immediateAction: null,
      actionDeadline: null,
      actionSteps: [
        {
          stepNumber: 1,
          step: 'Monitor payer portal for Cigna response by March 2 deadline.',
          estimatedTime: '5 minutes',
        },
        {
          stepNumber: 2,
          step: 'If no response by March 2, escalate to Cigna provider relations citing CMS 7-day response requirement.',
          estimatedTime: '15 minutes',
        },
      ],
      cmsComplianceAction: null,
      statusInterpretation:
        'Pending within CMS 7-day window. Cigna has until March 2 to respond.',
      riskAssessment: {
        procedureDateRisk: false,
        cmsViolationRisk: false,
        denialRisk: false,
        appealDeadlineRisk: false,
        riskSummary: null,
      },
      recommendedDocumentation: [],
      contactPayer: false,
      contactPayerReason: null,
    },
    'pa-004': {
      priority: 'URGENT',
      priorityReason:
        'Humana has exceeded the CMS 7-day standard response window by 4 days. This is a regulatory compliance violation requiring immediate escalation.',
      immediateAction:
        'Contact Humana provider relations and file CMS non-compliance escalation',
      actionDeadline: 'Today',
      actionSteps: [
        {
          stepNumber: 1,
          step: 'Call Humana provider relations at 1-800-XXX-XXXX and reference PA AUTH-2026-004388 for Robert Kim.',
          estimatedTime: '20 minutes',
        },
        {
          stepNumber: 2,
          step: 'Cite CMS Prior Authorization Final Rule (CMS-0057-F) and state that the 7-day standard response window was exceeded by 4 days.',
          estimatedTime: '5 minutes',
        },
        {
          stepNumber: 3,
          step: 'Document the date, time, representative name, and reference number from the call.',
          estimatedTime: '5 minutes',
        },
        {
          stepNumber: 4,
          step: 'If no resolution, prepare CMS non-compliance complaint with call documentation.',
          estimatedTime: '30 minutes',
        },
      ],
      cmsComplianceAction:
        'Call Humana provider relations at 1-800-XXX-XXXX. Cite CMS Prior Authorization Final Rule (CMS-0057-F). Document the date, time, representative name, and reference number. State that PA AUTH-2026-004388 was submitted February 17, CMS requires 7-day response, and Humana is 4 days overdue.',
      statusInterpretation:
        'PA is pending but Humana has violated the CMS 7-day standard response requirement. The PA was submitted February 17 and the response deadline was February 24. Humana is now 4 days overdue.',
      riskAssessment: {
        procedureDateRisk: false,
        cmsViolationRisk: true,
        denialRisk: false,
        appealDeadlineRisk: false,
        riskSummary:
          'CMS compliance violation — Humana has exceeded the 7-day standard response window by 4 days. Regulatory escalation leverage is available.',
      },
      recommendedDocumentation: [],
      contactPayer: true,
      contactPayerReason:
        'Humana is in violation of the CMS Prior Authorization Final Rule 7-day response requirement. Contact provider relations to escalate and document the violation.',
    },
    'pa-005': {
      priority: 'URGENT',
      priorityReason:
        'Urgent PA for critical care services with a 72-hour response window expiring March 1. Patient is actively admitted.',
      immediateAction:
        'Monitor BCBS IL response — 72-hour urgent window expires March 1',
      actionDeadline: 'March 1',
      actionSteps: [
        {
          stepNumber: 1,
          step: 'Check BCBS IL payer portal for any updates on AUTH-2026-005122 for Anita Patel.',
          estimatedTime: '5 minutes',
        },
        {
          stepNumber: 2,
          step: 'If no response by end of day February 28, call BCBS IL urgent PA line to request status update.',
          estimatedTime: '15 minutes',
        },
        {
          stepNumber: 3,
          step: 'If 72-hour window expires March 1 without response, escalate via CMS urgent PA compliance process.',
          estimatedTime: '30 minutes',
        },
      ],
      cmsComplianceAction: null,
      statusInterpretation:
        'Urgent PA for critical care services is pending with a 72-hour response deadline of March 1. Patient is currently admitted with acute respiratory failure. BCBS IL must respond by March 1.',
      riskAssessment: {
        procedureDateRisk: false,
        cmsViolationRisk: false,
        denialRisk: false,
        appealDeadlineRisk: false,
        riskSummary:
          'No immediate risk to procedure — patient is already admitted for inpatient critical care. Primary risk is the 72-hour urgent response window expiring March 1.',
      },
      recommendedDocumentation: [],
      contactPayer: false,
      contactPayerReason: null,
    },
    'pa-006': {
      priority: 'ACTION_REQUIRED',
      priorityReason:
        'UnitedHealthcare has requested specific clinical documentation to continue PA review. Documentation must be submitted by March 4 or the PA will be denied.',
      immediateAction:
        'Compile and submit requested clinical documentation to UHC by March 4',
      actionDeadline: 'Before March 4',
      actionSteps: [
        {
          stepNumber: 1,
          step: 'Retrieve operative planning MRI report with radiologist interpretation from imaging records.',
          estimatedTime: '15 minutes',
        },
        {
          stepNumber: 2,
          step: 'Compile physical therapy records documenting 6 weeks of conservative treatment failure.',
          estimatedTime: '20 minutes',
        },
        {
          stepNumber: 3,
          step: 'Gather pain management records including injection history with dates and outcomes.',
          estimatedTime: '15 minutes',
        },
        {
          stepNumber: 4,
          step: 'Submit complete documentation package to UHC via payer portal or fax before March 4 deadline.',
          estimatedTime: '20 minutes',
        },
      ],
      cmsComplianceAction: null,
      statusInterpretation:
        'PA is in additional information requested status. UHC has provided a specific list of required documentation with a March 4 deadline. The PA will not proceed without this documentation.',
      riskAssessment: {
        procedureDateRisk: false,
        cmsViolationRisk: false,
        denialRisk: false,
        appealDeadlineRisk: false,
        riskSummary:
          'Documentation deadline is March 4. Failure to submit will result in automatic PA denial.',
      },
      recommendedDocumentation: [
        'Operative planning MRI report with radiologist interpretation',
        'Physical therapy records documenting 6 weeks of conservative treatment failure',
        'Pain management records including injection history',
        'Functional assessment documenting impact on daily activities',
      ],
      contactPayer: false,
      contactPayerReason: null,
    },
    'pa-007': {
      priority: 'ACTION_REQUIRED',
      priorityReason:
        'PA has been denied for medical necessity. Appeal deadline is March 7. Peer-to-peer review is the strongest reversal path and should be requested within 48 hours.',
      immediateAction:
        'Request peer-to-peer review with Aetna medical director before appeal deadline March 7',
      actionDeadline: 'Within 48 hours',
      actionSteps: [
        {
          stepNumber: 1,
          step: 'Call Aetna provider relations to request peer-to-peer review for AUTH-2026-003247 (Dorothy Chen).',
          estimatedTime: '15 minutes',
        },
        {
          stepNumber: 2,
          step: 'Compile 18 months of physical therapy records and three corticosteroid injection records with dates and outcomes.',
          estimatedTime: '30 minutes',
        },
        {
          stepNumber: 3,
          step: 'Prepare letter of medical necessity citing ICD-10 M19.011 and documenting failed conservative treatment.',
          estimatedTime: '20 minutes',
        },
        {
          stepNumber: 4,
          step: 'Brief the orthopedic surgeon on peer-to-peer talking points: conservative treatment exhaustion, functional limitations, surgical necessity.',
          estimatedTime: '10 minutes',
        },
      ],
      cmsComplianceAction: null,
      statusInterpretation:
        'PA has been denied by Aetna for medical necessity (CR-044). The appeal deadline is March 7. The patient has extensive conservative treatment history that appears to have been missing from the original submission.',
      riskAssessment: {
        procedureDateRisk: false,
        cmsViolationRisk: false,
        denialRisk: true,
        appealDeadlineRisk: true,
        riskSummary:
          'Denial is active with a March 7 appeal deadline. Without peer-to-peer review or formal appeal, the denial stands and the patient cannot receive the procedure under this authorization.',
      },
      recommendedDocumentation: [
        '18 months of physical therapy records',
        'Three corticosteroid injection records with dates and outcomes',
        'Letter of medical necessity citing ICD-10 M19.011 and failed conservative treatment',
        'Orthopedic surgeon operative assessment',
      ],
      contactPayer: false,
      contactPayerReason: null,
    },
    'pa-008': {
      priority: 'ACTION_REQUIRED',
      priorityReason:
        'PA has been denied for site of service. A peer-to-peer review is scheduled for March 2. Preparation is needed to present clinical justification or site accommodation.',
      immediateAction:
        'Prepare for peer-to-peer review scheduled March 2 — focus on site of service accommodation',
      actionDeadline: 'Before March 2',
      actionSteps: [
        {
          stepNumber: 1,
          step: 'Review Cigna site of service policy for CPT 43280 (Nissen fundoplication) to understand their facility requirements.',
          estimatedTime: '15 minutes',
        },
        {
          stepNumber: 2,
          step: 'Prepare Barrett\'s esophagus pathology report and upper GI series results for peer-to-peer discussion.',
          estimatedTime: '15 minutes',
        },
        {
          stepNumber: 3,
          step: 'Draft letter explaining medical necessity for outpatient surgical center setting, or prepare to accommodate hospital-based setting.',
          estimatedTime: '20 minutes',
        },
      ],
      cmsComplianceAction: null,
      statusInterpretation:
        'PA has been denied by Cigna for site of service (CR-112), not for medical necessity. The underlying procedure is not in question. A peer-to-peer review is scheduled for March 2 to discuss facility setting.',
      riskAssessment: {
        procedureDateRisk: false,
        cmsViolationRisk: false,
        denialRisk: true,
        appealDeadlineRisk: false,
        riskSummary:
          'Denial is for site of service, not medical necessity. This is a procedural issue that is typically resolved through peer-to-peer discussion or facility accommodation.',
      },
      recommendedDocumentation: [
        "Barrett's esophagus pathology report",
        'Upper GI series results',
        'Letter explaining medical necessity for outpatient surgical center setting',
      ],
      contactPayer: false,
      contactPayerReason: null,
    },
    'pa-009': {
      priority: 'CRITICAL',
      priorityReason:
        'Urgent PA for an 86-year-old patient with surgery scheduled tomorrow has exceeded the CMS 72-hour urgent response window. This is the highest-priority case in the practice.',
      immediateAction:
        'Call Humana Medicare Advantage provider relations NOW — urgent PA exceeded 72-hour CMS window, surgery is tomorrow March 1',
      actionDeadline: 'Before EOD today',
      actionSteps: [
        {
          stepNumber: 1,
          step: 'Call Humana Medicare Advantage provider relations immediately and reference PA AUTH-2026-005389 for Sandra Rodriguez.',
          estimatedTime: '20 minutes',
        },
        {
          stepNumber: 2,
          step: 'Cite CMS Prior Authorization Final Rule (CMS-0057-F) urgent PA provision requiring 72-hour response. State PA was submitted February 24, deadline was February 27, and Humana is 1 day overdue.',
          estimatedTime: '10 minutes',
        },
        {
          stepNumber: 3,
          step: 'Demand same-day authorization decision given surgery is scheduled for March 1. Document representative name, time, and reference number.',
          estimatedTime: '10 minutes',
        },
        {
          stepNumber: 4,
          step: 'If no resolution by end of day, brief the surgeon on the situation so a clinical decision can be made regarding proceeding at financial risk vs. delaying for an elderly patient in pain.',
          estimatedTime: '15 minutes',
        },
      ],
      cmsComplianceAction:
        'Call Humana Medicare Advantage provider relations immediately. Cite CMS Prior Authorization Final Rule (CMS-0057-F) urgent PA provision requiring 72-hour response. PA AUTH-2026-005389 was submitted February 24, 72-hour deadline was February 27. Humana is 1 day overdue on an urgent PA for an 86-year-old patient with surgery scheduled tomorrow. Document everything for potential CMS complaint filing.',
      statusInterpretation:
        'CRITICAL: Urgent PA for hip revision surgery has exceeded the CMS 72-hour urgent response window by 1 day. The patient is 86 years old with surgery scheduled tomorrow, March 1. Humana Medicare Advantage has not responded.',
      riskAssessment: {
        procedureDateRisk: true,
        cmsViolationRisk: true,
        denialRisk: false,
        appealDeadlineRisk: false,
        riskSummary:
          'Surgery is scheduled for tomorrow with no authorization. CMS 72-hour urgent response window has been violated. The patient is elderly and in pain from prosthesis failure. Delay creates both clinical and administrative risk.',
      },
      recommendedDocumentation: [],
      contactPayer: true,
      contactPayerReason:
        'Humana Medicare Advantage has violated the CMS 72-hour urgent PA response requirement. Surgery is tomorrow. Immediate contact is required to obtain authorization or document the violation for CMS complaint.',
    },
    'pa-010': {
      priority: 'APPROVED',
      priorityReason:
        'PA is approved with the procedure date well within the 90-day authorization window. No action is needed.',
      immediateAction: null,
      actionDeadline: null,
      actionSteps: [
        {
          stepNumber: 1,
          step: 'Confirm procedure scheduling for David Park knee arthroscopy on April 8.',
          estimatedTime: '5 minutes',
        },
        {
          stepNumber: 2,
          step: 'Verify surgical facility has received authorization confirmation.',
          estimatedTime: '5 minutes',
        },
      ],
      cmsComplianceAction: null,
      statusInterpretation:
        'PA approved with 90-day window through May 13. Procedure April 8 is well within authorization window. No action required.',
      riskAssessment: {
        procedureDateRisk: false,
        cmsViolationRisk: false,
        denialRisk: false,
        appealDeadlineRisk: false,
        riskSummary: null,
      },
      recommendedDocumentation: [],
      contactPayer: false,
      contactPayerReason: null,
    },
  },
  perPAPredictions: {
    'pa-001': null,
    'pa-002': null,
    'pa-003': {
      approvalLikelihood: 'HIGH',
      confidenceExplanation:
        'Standard diagnostic endoscopy with biopsy for dysphagia evaluation has high approval rates across all major payers. Cigna typically approves GI diagnostic procedures when clinical indication is documented. The PA was submitted within normal timeframes and no prior denials exist.',
      keyFactors: [
        {
          factor: 'Diagnostic procedure',
          impact: 'POSITIVE',
          explanation:
            'Diagnostic endoscopy with biopsy has consistently high approval rates',
        },
        {
          factor: 'Clear clinical indication',
          impact: 'POSITIVE',
          explanation:
            'Dysphagia with suspected esophageal pathology is a well-established indication',
        },
        {
          factor: 'Standard submission timeline',
          impact: 'POSITIVE',
          explanation:
            'Submitted 14 days before procedure, within normal window',
        },
      ],
      likelyDenialReason: null,
      bestApproachToApproval:
        'No additional action needed. Standard diagnostic procedures with documented symptoms are rarely denied. Monitor for payer response by March 2.',
      peerToPeerRecommended: false,
      alternativeProcedureCode: null,
    },
    'pa-004': {
      approvalLikelihood: 'MEDIUM',
      confidenceExplanation:
        'Lumbar laminectomy has moderate approval rates and Humana typically requires documentation of failed conservative treatment and specific imaging criteria. The CMS compliance violation creates escalation leverage but does not guarantee approval.',
      keyFactors: [
        {
          factor: 'CMS compliance violation',
          impact: 'POSITIVE',
          explanation:
            "Humana's failure to respond within 7 days creates regulatory escalation leverage",
        },
        {
          factor: 'Surgical procedure',
          impact: 'NEGATIVE',
          explanation:
            'Spinal surgery requires extensive documentation of conservative treatment failure',
        },
        {
          factor: 'Progressive neurological symptoms',
          impact: 'POSITIVE',
          explanation:
            'Lower extremity weakness indicates medical urgency supporting necessity',
        },
      ],
      likelyDenialReason:
        'Insufficient documentation of conservative treatment failure (physical therapy, epidural injections)',
      bestApproachToApproval:
        'Lead with CMS compliance violation in all communications. Simultaneously prepare comprehensive documentation package: MRI with radiologist interpretation, PT records showing treatment failure, neurological exam documenting progressive weakness.',
      peerToPeerRecommended: false,
      alternativeProcedureCode: null,
    },
    'pa-005': {
      approvalLikelihood: 'HIGH',
      confidenceExplanation:
        'Critical care services for acute respiratory failure during active hospital admission have very high approval rates. Urgent PAs for inpatient emergency services are rarely denied when clinical documentation supports medical necessity.',
      keyFactors: [
        {
          factor: 'Emergency admission',
          impact: 'POSITIVE',
          explanation:
            'Acute respiratory failure requiring critical care is a clear emergency',
        },
        {
          factor: 'Urgent PA classification',
          impact: 'POSITIVE',
          explanation: '72-hour urgent window reflects clinical acuity',
        },
        {
          factor: 'Active inpatient status',
          impact: 'POSITIVE',
          explanation:
            'Patient is currently admitted, establishing ongoing medical necessity',
        },
      ],
      likelyDenialReason: null,
      bestApproachToApproval:
        'Ensure attending physician documentation clearly establishes medical necessity for critical care level services. If BCBS does not respond by March 1 deadline, escalate via CMS urgent PA compliance process.',
      peerToPeerRecommended: false,
      alternativeProcedureCode: null,
    },
    'pa-006': {
      approvalLikelihood: 'MEDIUM',
      confidenceExplanation:
        'Lumbar spinal fusion approval depends heavily on documentation quality. UHC has requested specific records, which means the clinical indication is not yet established to their satisfaction. Compliance with documentation request within the deadline significantly improves odds.',
      keyFactors: [
        {
          factor: 'Documentation request',
          impact: 'NEUTRAL',
          explanation:
            'Payer requesting records is standard for surgical PAs — not inherently negative',
        },
        {
          factor: 'Specific documentation list',
          impact: 'POSITIVE',
          explanation:
            'UHC has told you exactly what they need — reduces guesswork',
        },
        {
          factor: 'Conservative treatment requirement',
          impact: 'NEGATIVE',
          explanation:
            'Must document 6 weeks of failed conservative treatment — strict threshold',
        },
      ],
      likelyDenialReason:
        'Failure to provide requested documentation by March 4 deadline, or insufficient conservative treatment duration',
      bestApproachToApproval:
        'Submit all requested documentation before March 4. Include operative planning MRI with detailed radiologist report, comprehensive PT records with treatment dates and outcomes, and a letter of medical necessity from the surgeon citing specific clinical criteria.',
      peerToPeerRecommended: false,
      alternativeProcedureCode: null,
    },
    'pa-007': {
      approvalLikelihood: 'LOW',
      confidenceExplanation:
        'The initial PA was denied for medical necessity. However, the patient has substantial supporting documentation (18 months PT, corticosteroid injections) that was apparently not included in the original submission. A peer-to-peer review with this documentation has a high probability of reversal.',
      keyFactors: [
        {
          factor: 'Medical necessity denial',
          impact: 'NEGATIVE',
          explanation:
            'Aetna has explicitly denied on clinical criteria grounds',
        },
        {
          factor: 'Extensive conservative treatment history',
          impact: 'POSITIVE',
          explanation:
            '18 months of PT and 3 corticosteroid injections strongly support surgical necessity',
        },
        {
          factor: 'Peer-to-peer availability',
          impact: 'POSITIVE',
          explanation:
            'Physician-to-physician review reverses medical necessity denials at approximately 67% rate for orthopedic procedures',
        },
      ],
      likelyDenialReason:
        'Aetna CR-044: Not medically necessary per clinical criteria — likely missing documentation of conservative treatment failure in original submission',
      bestApproachToApproval:
        'Request peer-to-peer review immediately. Prepare a concise case summary for the reviewing physician: 18 months of PT with documented failure, 3 corticosteroid injections with temporary relief, current functional limitations, and orthopedic surgeon\'s assessment that conservative options are exhausted.',
      peerToPeerRecommended: true,
      alternativeProcedureCode: null,
    },
    'pa-008': {
      approvalLikelihood: 'MEDIUM',
      confidenceExplanation:
        "The denial is for site of service, not medical necessity. This is a procedural denial that can often be resolved through peer-to-peer discussion or by agreeing to the payer's preferred setting. The underlying procedure approval is not in question.",
      keyFactors: [
        {
          factor: 'Site of service denial (not medical necessity)',
          impact: 'POSITIVE',
          explanation:
            'Procedural denials are easier to resolve than clinical denials',
        },
        {
          factor: "Barrett's esophagus documentation",
          impact: 'POSITIVE',
          explanation:
            'Documented esophageal damage supports medical necessity of the procedure itself',
        },
        {
          factor: 'Payer site preference',
          impact: 'NEGATIVE',
          explanation:
            'Cigna requires hospital-based setting for this procedure code — may need to accommodate',
        },
      ],
      likelyDenialReason:
        'CR-112: Site of service not covered — Cigna policy requires hospital-based setting for CPT 43280',
      bestApproachToApproval:
        "In the March 2 peer-to-peer, present two options: (1) clinical justification for outpatient surgical center based on patient factors, or (2) willingness to move procedure to hospital-based setting if Cigna covers the facility differential. Most site-of-service denials resolve when the provider accommodates the payer's facility preference.",
      peerToPeerRecommended: true,
      alternativeProcedureCode: null,
    },
    'pa-009': {
      approvalLikelihood: 'MEDIUM',
      confidenceExplanation:
        "Urgent hip revision surgery for prosthesis failure in an 86-year-old patient has strong medical necessity. The CMS compliance violation creates significant escalation leverage. However, the extreme time pressure (surgery tomorrow) means approval may not arrive in time regardless of the PA's merit.",
      keyFactors: [
        {
          factor: 'Clear medical necessity',
          impact: 'POSITIVE',
          explanation:
            'Prosthesis loosening causing severe pain and mobility loss in elderly patient',
        },
        {
          factor: 'CMS 72-hour urgent violation',
          impact: 'POSITIVE',
          explanation:
            "Humana's failure to respond within 72 hours provides regulatory escalation leverage",
        },
        {
          factor: 'Extreme time pressure',
          impact: 'NEGATIVE',
          explanation:
            'Surgery is tomorrow — even if PA is approved today, administrative processing may not complete in time',
        },
      ],
      likelyDenialReason: null,
      bestApproachToApproval:
        'Invoke CMS compliance violation in every communication — payers respond faster when faced with documented regulatory non-compliance. Call Humana Medicare Advantage provider relations immediately. If no response by end of day, the surgeon must make a clinical decision: proceed with surgery at financial risk or delay for an elderly patient in pain.',
      peerToPeerRecommended: false,
      alternativeProcedureCode: null,
    },
    'pa-010': null,
  },
  paSummary: {
    criticalCount: 1,
    urgentCount: 3,
    actionRequiredCount: 3,
    monitorCount: 1,
    approvedCount: 2,
    totalPAsInFeed: 10,
    cmsViolationCount: 2,
    proceduresAtRiskCount: 2,
    topThreeActions: [
      {
        rank: 1,
        action:
          'Call Humana Medicare Advantage provider relations TODAY for AUTH-2026-005389 (Sandra Rodriguez) — urgent PA exceeded 72-hour CMS window, surgery is tomorrow March 1. Cite CMS Prior Authorization Final Rule (CMS-0057-F) and document the call.',
        affectedPAIds: ['pa-009'],
        urgencyReason:
          'Surgery scheduled tomorrow with no authorization. CMS 72-hour urgent response window exceeded.',
      },
      {
        rank: 2,
        action:
          'Submit clinical documentation for AUTH-2026-004019 (Marcus Johnson) to UnitedHealthcare by March 4 — operative MRI report, 6 weeks conservative treatment failure records, functional assessment.',
        affectedPAIds: ['pa-006'],
        urgencyReason:
          'Documentation deadline in 4 business days. Failure to submit will result in PA denial.',
      },
      {
        rank: 3,
        action:
          'Request peer-to-peer review with Aetna for AUTH-2026-003247 (Dorothy Chen) before March 7 appeal deadline — physician-to-physician review is strongest reversal path for medical necessity denials.',
        affectedPAIds: ['pa-007'],
        urgencyReason:
          'Appeal deadline in 7 days. Peer-to-peer has 67% reversal rate for orthopedic medical necessity denials.',
      },
    ],
    practiceHealthSummary:
      "This practice has 10 outstanding prior authorizations with 1 critical case requiring same-day intervention and 2 active CMS compliance violations. The PA workload is concentrated in surgical procedures, where documentation requirements are highest. Two PAs are denied and require active appeal management. Overall, the practice's PA pipeline shows moderate risk — the critical hip revision case and the two Humana compliance violations require immediate staff attention today.",
    cmsComplianceSummary:
      'Two payers are in violation of the CMS Prior Authorization Final Rule. Humana has exceeded the 7-day standard response window by 4 days for AUTH-2026-004388 (Robert Kim, lumbar laminectomy). Humana Medicare Advantage has exceeded the 72-hour urgent response window by 1 day for AUTH-2026-005389 (Sandra Rodriguez, hip revision). Both violations are with Humana-affiliated plans, suggesting a systemic authorization processing delay at this payer. File CMS non-compliance escalations for both cases today.',
    flaggedForImmediateAttention: ['pa-009', 'pa-004', 'pa-002'],
    insight:
      "Both CMS compliance violations involve Humana-affiliated plans (Humana standard and Humana Medicare Advantage), suggesting a systemic authorization processing delay rather than isolated incidents. Additionally, two of the three denied or documentation-pending PAs (PA 7 and PA 8) involve surgical procedures where the denial is driven by documentation gaps rather than categorical policy exclusions. A standardized pre-submission clinical documentation checklist for surgical PAs could prevent these denials at the source, reducing the practice's denial rate and eliminating rework.",
  },
}
