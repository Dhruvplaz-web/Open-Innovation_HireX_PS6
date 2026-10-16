import React from 'react';
import { CodeLabView } from './CodeLab/CodeLabView';

/**
 * Algorithmic Code Lab & AST Auditor (Upgraded from legacy Aptitude Arena)
 * Completely integrates the 5-dimensional rubric scoring, AST Big-O static complexity auditor,
 * in-memory SQLite sandbox, career-aware missions, and cryptographic SHA-256 verification.
 * Zero-breakage drop-in replacement maintaining all existing links, tabs, and connections.
 */
export const AptitudeArenaView: React.FC = () => {
  return <CodeLabView />;
};

export default AptitudeArenaView;
