
import React from 'react';
import { Status } from './types';

export const getStatusColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (percentage >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-rose-600 bg-rose-50 border-rose-200';
};

export const getStatusLabel = (percentage: number): Status => {
  if (percentage >= 90) return Status.ON_TRACK;
  if (percentage >= 70) return Status.WARNING;
  return Status.CRITICAL;
};

export const getCurrentQuarter = (): number => {
  const month = new Date().getMonth();
  if (month < 3) return 1;
  if (month < 6) return 2;
  if (month < 9) return 3;
  return 4;
};
