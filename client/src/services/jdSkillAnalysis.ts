/**
 * Pure, Deterministic Job Description (JD) Skill Analysis Service.
 * Evaluates student verified skills against structured or derived opportunity requirements.
 *
 * CRITICAL FAIRNESS & ARCHITECTURAL RULES:
 * 1. Pure, deterministic, explainable (no black-box models, no paid APIs).
 * 2. Uses skills only. Strictly ignores name, gender, college, region, and personal attributes.
 * 3. Not-assessed skills always report NOT_ASSESSED and studentScore: null. Never invent a score.
 * 4. Missing or GAP MUST_HAVE caps the verdict at PARTIAL_FIT with plain-English explanation.
 * 5. All weights, multipliers, and thresholds are centralized in JD_ANALYSIS_CONFIG.
 */

import {
  SkillRequirement,
  JDFitVerdict,
  JDFitSkillDetail,
  JDFitSummary,
  JDFitAnalysisResult,
  RequirementImportance
} from '../types';

// Canonical Alias Normalization Map
export const CANONICAL_SKILL_MAP: Record<string, string> = {
  // Programming Languages
  python: 'Python',
  'python 3': 'Python',
  python3: 'Python',
  py: 'Python',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  java: 'Java',
  'core java': 'Java',
  'c++': 'C++',
  cpp: 'C++',
  c: 'C',
  'c#': 'C#',
  csharp: 'C#',
  go: 'Go',
  golang: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',

  // Frameworks & Libraries
  react: 'React',
  'react.js': 'React',
  reactjs: 'React',
  'react 19': 'React',
  fastapi: 'FastAPI',
  'fast api': 'FastAPI',
  django: 'Django',
  flask: 'Flask',
  'node.js': 'Node.js',
  nodejs: 'Node.js',
  node: 'Node.js',
  'express.js': 'Express.js',
  express: 'Express.js',
  'spring boot': 'Spring Boot',
  springboot: 'Spring Boot',
  angular: 'Angular',
  'vue.js': 'Vue.js',
  vue: 'Vue.js',
  'next.js': 'Next.js',
  nextjs: 'Next.js',
  'tailwind css': 'Tailwind CSS',
  tailwind: 'Tailwind CSS',

  // AI & ML
  'machine learning': 'Machine Learning',
  ml: 'Machine Learning',
  'deep learning': 'Deep Learning',
  dl: 'Deep Learning',
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  'scikit-learn': 'Scikit-Learn',
  pandas: 'Pandas',
  numpy: 'NumPy',
  llm: 'LLMs & Generative AI',
  'generative ai': 'LLMs & Generative AI',
  nlp: 'Natural Language Processing',

  // Cloud & DevOps & DB
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  'cloud computing': 'Cloud Computing',
  cloud: 'Cloud Computing',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'Google Cloud',
  'google cloud': 'Google Cloud',
  sql: 'SQL',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
  git: 'Git',
  github: 'Git',
  'ci/cd': 'CI/CD Pipelines',
  linux: 'Linux',

  // Fundamentals
  'data structures': 'Data Structures',
  dsa: 'Data Structures',
  algorithms: 'Data Structures',
  oop: 'OOP',
  'system design': 'System Design',
  'ui/ux design': 'UI/UX Design'
};

export const normalizeSkillName = (rawName: string): string => {
  if (!rawName) return '';
  const clean = rawName.trim().toLowerCase();
  return CANONICAL_SKILL_MAP[clean] || rawName.trim();
};

// ==============================================================================
// CONFIGURATION & THRESHOLDS (Centralized & Commented)
// ==============================================================================
export const JD_ANALYSIS_CONFIG = {
  // Importance weights
  weights: {
    MUST_HAVE: 2.0,
    NICE_TO_HAVE: 1.0
  },
  // Related skill multiplier
  relatedMultiplier: 0.6,
  // Coverage thresholds
  coverageThresholds: {
    met: 1.0, // coverage >= 1.0 => MET
    partial: 0.5 // 0.5 <= coverage < 1.0 => PARTIAL, else GAP
  },
  // Overall fit verdict thresholds
  verdictThresholds: {
    strongFit: 80.0,
    goodFit: 60.0,
    partialFit: 40.0
  },
  // Default target levels when unspecified
  defaultTargetLevels: {
    MUST_HAVE: 70,
    NICE_TO_HAVE: 65
  },
  // Configurable directional/symmetric related skill mappings
  relatedSkills: {
    mysql: ['postgresql', 'sql', 'sqlite'],
    postgresql: ['mysql', 'sql', 'sqlite'],
    sql: ['postgresql', 'mysql'],
    react: ['vue.js', 'angular', 'next.js'],
    'vue.js': ['react'],
    angular: ['react'],
    fastapi: ['flask', 'django'],
    flask: ['fastapi', 'django'],
    django: ['fastapi', 'flask'],
    pytorch: ['tensorflow', 'machine learning'],
    tensorflow: ['pytorch', 'machine learning'],
    docker: ['kubernetes', 'cloud computing'],
    kubernetes: ['docker', 'cloud computing'],
    aws: ['google cloud', 'azure', 'cloud computing'],
    'google cloud': ['aws', 'azure', 'cloud computing'],
    azure: ['aws', 'google cloud', 'cloud computing'],
    typescript: ['javascript'],
    javascript: ['typescript'],
    java: ['c#', 'c++', 'spring boot'],
    'spring boot': ['java'],
    'c++': ['c', 'java']
  } as Record<string, string[]>
};

/**
 * Derives structured skill requirements if opportunity.skillRequirements is empty.
 */
export function deriveRequirementsFromOpportunity(opportunity: any): SkillRequirement[] {
  const reqs: SkillRequirement[] = [];

  // 1. Explicit requirements if present
  const explicit = opportunity?.skillRequirements || opportunity?.skill_requirements;
  if (Array.isArray(explicit) && explicit.length > 0) {
    for (const r of explicit) {
      let importance: RequirementImportance = 'MUST_HAVE';
      if (r.importance === 'NICE_TO_HAVE' || String(r.importance).toLowerCase().includes('nice')) {
        importance = 'NICE_TO_HAVE';
      }
      const target = Number(r.targetLevel || r.target_level || JD_ANALYSIS_CONFIG.defaultTargetLevels[importance]);
      reqs.push({
        skill: normalizeSkillName(r.skill || ''),
        importance,
        targetLevel: target
      });
    }
    return reqs;
  }

  // 2. Derive from required_skills & good_to_have
  const baseTarget = Number(opportunity?.min_verified_score || JD_ANALYSIS_CONFIG.defaultTargetLevels.MUST_HAVE);
  const proficiencies = opportunity?.min_skill_proficiencies || {};

  if (Array.isArray(opportunity?.required_skills)) {
    for (const s of opportunity.required_skills) {
      const normS = normalizeSkillName(s);
      const target = Number(proficiencies[s] || proficiencies[normS] || baseTarget);
      reqs.push({
        skill: normS,
        importance: 'MUST_HAVE',
        targetLevel: target
      });
    }
  }

  if (Array.isArray(opportunity?.good_to_have)) {
    for (const s of opportunity.good_to_have) {
      const normS = normalizeSkillName(s);
      if (reqs.some((r) => r.skill === normS)) continue;
      const target = Number(proficiencies[s] || JD_ANALYSIS_CONFIG.defaultTargetLevels.NICE_TO_HAVE);
      reqs.push({
        skill: normS,
        importance: 'NICE_TO_HAVE',
        targetLevel: target
      });
    }
  }

  return reqs;
}

/**
 * Normalizes student skills lookup into canonical map.
 */
function normalizeStudentSkills(
  studentSkills: any
): Record<string, { canonicalName: string; score: number | null; verified: boolean; date?: string }> {
  const normalized: Record<string, { canonicalName: string; score: number | null; verified: boolean; date?: string }> =
    {};
  if (!studentSkills || typeof studentSkills !== 'object') return normalized;

  for (const [k, v] of Object.entries(studentSkills)) {
    const cName = normalizeSkillName(k);
    if (!cName) continue;

    let score: number | null = null;
    let verified = false;
    let dateStr: string | undefined = undefined;

    if (v && typeof v === 'object') {
      const vObj = v as any;
      score = typeof vObj.score === 'number' ? vObj.score : null;
      verified = Boolean(vObj.verified);
      dateStr = vObj.verifiedDate || vObj.date;
    } else if (typeof v === 'number') {
      score = v;
    }

    normalized[cName.toLowerCase()] = {
      canonicalName: cName,
      score,
      verified,
      date: dateStr
    };
  }

  return normalized;
}

/**
 * Pure, deterministic evaluation of student skills against JD requirements.
 */
export function analyzeStudentForOpportunity(
  studentSkills: any,
  requirements?: SkillRequirement[] | any | null,
  options?: { opportunity?: any }
): JDFitAnalysisResult {
  const config = JD_ANALYSIS_CONFIG;

  // Resolve requirements
  let opp = options?.opportunity;
  if (!opp && requirements && !Array.isArray(requirements) && typeof requirements === 'object') {
    opp = requirements;
    requirements = (opp as any).skillRequirements || null;
  }

  let reqList: SkillRequirement[] = [];
  if (Array.isArray(requirements) && requirements.length > 0) {
    reqList = requirements;
  } else if (opp) {
    reqList = deriveRequirementsFromOpportunity(opp);
  }

  const normSkillsLookup = normalizeStudentSkills(studentSkills);

  const skillsAnalysis: JDFitSkillDetail[] = [];
  const explanations: string[] = [];

  let totalWeightedCoverage = 0.0;
  let totalWeights = 0.0;

  let mustHaveWeightedCov = 0.0;
  let mustHaveWeights = 0.0;

  let niceHaveWeightedCov = 0.0;
  let niceHaveWeights = 0.0;

  let hasMustHaveGapOrUnassessed = false;
  const mustHaveUnmetSkills: string[] = [];

  // Check freshness dates
  const hasAnyDates = Object.values(normSkillsLookup).some((item) => Boolean(item.date));
  const decayNote = !hasAnyDates ? 'Freshness decay skipped: no assessment dates recorded.' : null;

  for (const r of reqList) {
    const rawSkillName = r.skill || '';
    const normReqName = normalizeSkillName(rawSkillName);
    const importance: RequirementImportance = r.importance === 'NICE_TO_HAVE' ? 'NICE_TO_HAVE' : 'MUST_HAVE';
    const targetLevel = Math.max(1, Math.min(100, Number(r.targetLevel || config.defaultTargetLevels[importance])));
    const weight = config.weights[importance] || 1.0;

    let matchedVia: 'EXACT' | 'ALIAS' | 'RELATED' | 'NONE' = 'NONE';
    let matchedSkillName: string | null = null;
    let rawScore: number | null = null;
    let effectiveScore = 0.0;

    const keyLower = normReqName.toLowerCase();

    if (normSkillsLookup[keyLower] && normSkillsLookup[keyLower].score !== null) {
      matchedVia = rawSkillName.trim().toLowerCase() === normReqName.toLowerCase() ? 'EXACT' : 'ALIAS';
      matchedSkillName = normSkillsLookup[keyLower].canonicalName;
      rawScore = normSkillsLookup[keyLower].score;
      effectiveScore = rawScore!;
    } else {
      // Related skills fallback
      const relKeys = config.relatedSkills[keyLower] || [];
      for (const relK of relKeys) {
        if (normSkillsLookup[relK] && normSkillsLookup[relK].score !== null) {
          matchedVia = 'RELATED';
          matchedSkillName = normSkillsLookup[relK].canonicalName;
          rawScore = normSkillsLookup[relK].score;
          effectiveScore = rawScore! * config.relatedMultiplier;
          break;
        }
      }
    }

    let status: 'MET' | 'PARTIAL' | 'GAP' | 'NOT_ASSESSED' = 'NOT_ASSESSED';
    let coverage = 0.0;
    let gap = targetLevel;

    if (rawScore === null) {
      status = 'NOT_ASSESSED';
      coverage = 0.0;
      gap = targetLevel;
    } else {
      coverage = Math.min(1.0, Math.max(0.0, effectiveScore / targetLevel));
      gap = Math.max(0, Math.round(targetLevel - effectiveScore));

      if (coverage >= config.coverageThresholds.met) {
        status = 'MET';
      } else if (coverage >= config.coverageThresholds.partial) {
        status = 'PARTIAL';
      } else {
        status = 'GAP';
      }
    }

    if (importance === 'MUST_HAVE') {
      mustHaveWeights += weight;
      mustHaveWeightedCov += weight * coverage;
      if (status === 'GAP' || status === 'NOT_ASSESSED') {
        hasMustHaveGapOrUnassessed = true;
        mustHaveUnmetSkills.push(normReqName);
      }
    } else {
      niceHaveWeights += weight;
      niceHaveWeightedCov += weight * coverage;
    }

    totalWeights += weight;
    totalWeightedCoverage += weight * coverage;

    skillsAnalysis.push({
      skill: normReqName,
      importance,
      targetLevel,
      studentScore: rawScore,
      effectiveScore: rawScore !== null ? Math.round(effectiveScore * 10) / 10 : null,
      matchedVia,
      matchedSkill: matchedSkillName,
      coverage: Math.round(coverage * 1000) / 1000,
      status,
      gap
    });
  }

  // Calculate overall fit
  const rawOverallFit = totalWeights > 0 ? (totalWeightedCoverage / totalWeights) * 100.0 : 0.0;
  const overallFit = Math.max(0, Math.min(100, Math.round(rawOverallFit)));

  const mustHaveCoveragePct =
    mustHaveWeights > 0 ? Math.round((mustHaveWeightedCov / mustHaveWeights) * 1000) / 10 : 100.0;
  const niceHaveCoveragePct =
    niceHaveWeights > 0 ? Math.round((niceHaveWeightedCov / niceHaveWeights) * 1000) / 10 : 100.0;

  // Base verdict
  const vt = config.verdictThresholds;
  let baseVerdict: JDFitVerdict = 'NEEDS_WORK';
  if (overallFit >= vt.strongFit) {
    baseVerdict = 'STRONG_FIT';
  } else if (overallFit >= vt.goodFit) {
    baseVerdict = 'GOOD_FIT';
  } else if (overallFit >= vt.partialFit) {
    baseVerdict = 'PARTIAL_FIT';
  }

  // Enforce MUST_HAVE capping rule:
  let finalVerdict = baseVerdict;
  let cappedDueToMustHave = false;
  if (hasMustHaveGapOrUnassessed) {
    if (baseVerdict === 'STRONG_FIT' || baseVerdict === 'GOOD_FIT') {
      finalVerdict = 'PARTIAL_FIT';
      cappedDueToMustHave = true;
    } else if (baseVerdict === 'PARTIAL_FIT') {
      cappedDueToMustHave = true;
    }
  }

  // Top gaps (max 3, prioritized by MUST_HAVE first, then gap size)
  const unmetSkills = skillsAnalysis.filter((s) => s.status === 'GAP' || s.status === 'NOT_ASSESSED' || s.status === 'PARTIAL');
  unmetSkills.sort((a, b) => {
    const aPrio = a.importance === 'MUST_HAVE' ? 0 : 1;
    const bPrio = b.importance === 'MUST_HAVE' ? 0 : 1;
    if (aPrio !== bPrio) return aPrio - bPrio;
    return b.gap - a.gap;
  });
  const topGaps = unmetSkills.slice(0, 3);

  // Generate plain-English explanations
  const metCount = skillsAnalysis.filter((s) => s.status === 'MET').length;
  const totalCount = skillsAnalysis.length;

  explanations.push(`Overall JD fit: ${overallFit}% with ${metCount} of ${totalCount} requirements fully met.`);
  explanations.push(
    `Must-have requirement coverage is ${mustHaveCoveragePct}%; preferred skills coverage is ${niceHaveCoveragePct}%.`
  );

  if (cappedDueToMustHave) {
    const unmetNames = mustHaveUnmetSkills.slice(0, 3).join(', ');
    explanations.push(
      `Verdict capped at PARTIAL_FIT due to missing or below-target core must-have requirement(s): ${unmetNames}.`
    );
  } else {
    if (finalVerdict === 'STRONG_FIT') {
      explanations.push('High alignment across all primary verified technical benchmarks.');
    } else if (finalVerdict === 'GOOD_FIT') {
      explanations.push('Solid core match with minor opportunities for competency expansion.');
    } else if (finalVerdict === 'PARTIAL_FIT') {
      explanations.push('Partial alignment. Target specific gap labs or skill assessments to raise fit.');
    } else {
      explanations.push('Foundational development required across key role competencies.');
    }
  }

  const relatedMatches = skillsAnalysis.filter((s) => s.matchedVia === 'RELATED');
  if (relatedMatches.length > 0) {
    const relInfo = relatedMatches.map((r) => `${r.skill} via ${r.matchedSkill} (x0.6 factor)`).join(', ');
    explanations.push(`Related skill equivalence applied: ${relInfo}.`);
  }

  if (decayNote) {
    explanations.push(decayNote);
  }

  const summaryData: JDFitSummary = {
    mustHaveCoverage: mustHaveCoveragePct,
    niceToHaveCoverage: niceHaveCoveragePct,
    topGaps: topGaps.map((g) => g.skill),
    metCount,
    totalCount
  };

  return {
    overallFit,
    mustHaveCoverage: mustHaveCoveragePct,
    niceToHaveCoverage: niceHaveCoveragePct,
    verdict: finalVerdict,
    verdictExplanation: explanations.join(' '),
    skills: skillsAnalysis,
    topGaps,
    criticalGaps: topGaps,
    summary: summaryData,
    explanation: explanations
  };
}
