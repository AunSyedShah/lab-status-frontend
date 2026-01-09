import { useContext } from 'react';
import { ReferenceDataContext } from './ReferenceDataContextCreate';

export const useReferenceData = () => {
  const context = useContext(ReferenceDataContext);
  if (!context) {
    throw new Error('useReferenceData must be used within ReferenceDataProvider');
  }
  return context;
};
