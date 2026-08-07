import { Equipment } from '../types';
import { equipmentData } from '../data';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'Equipment' | 'Department' | 'Engineer' | 'Report' | 'Maintenance' | 'Compliance';
  icon: string;
  path: string;
}

export const getSearchResults = (query: string): SearchResult[] => {
  if (!query) return [];
  const q = query.toLowerCase();

  const results: SearchResult[] = [];

  // Search Equipment
  equipmentData.forEach(e => {
    if (e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)) {
      results.push({
        id: e.id,
        title: e.name,
        description: e.category,
        category: 'Equipment',
        icon: 'Activity',
        path: 'Equipment'
      });
    }
  });

  // Search Departments (Mocked)
  ['ICU', 'Emergency', 'Cardiology', 'Radiology'].forEach(d => {
    if (d.toLowerCase().includes(q)) {
      results.push({
        id: d,
        title: d,
        description: 'Department Overview',
        category: 'Department',
        icon: 'Building',
        path: 'Dashboard'
      });
    }
  });

  return results.slice(0, 10);
};
