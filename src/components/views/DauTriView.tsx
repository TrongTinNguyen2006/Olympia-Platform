import React from 'react';
import { MatchState } from '../../types.js';
import { DauTriViewer } from '../viewer/DauTriViewer.js';

interface DauTriViewProps {
  state: MatchState;
  questions: any;
}

export const DauTriView: React.FC<DauTriViewProps> = (props) => {
  return <DauTriViewer {...props} />;
};
