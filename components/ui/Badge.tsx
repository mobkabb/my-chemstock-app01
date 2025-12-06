import React from 'react';
import { QcStatus } from '../../types';

interface BadgeProps {
  status: QcStatus | string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  let styles = "px-2.5 py-0.5 rounded-full text-xs font-medium border ";
  
  switch (status) {
    case QcStatus.RELEASED:
      styles += "bg-green-50 text-green-700 border-green-200";
      break;
    case QcStatus.QUARANTINE:
      styles += "bg-yellow-50 text-yellow-700 border-yellow-200";
      break;
    case QcStatus.REJECTED:
      styles += "bg-red-50 text-red-700 border-red-200";
      break;
    case 'LOW STOCK':
      styles += "bg-orange-50 text-orange-700 border-orange-200";
      break;
    default:
      styles += "bg-slate-100 text-slate-700 border-slate-200";
  }

  return <span className={styles}>{status}</span>;
};