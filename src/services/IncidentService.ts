import { fetchIncidents as apiFetchIncidents, updateIncident as apiUpdateIncident } from './erpService';
import { IncidentData } from '@/data/mockDatabase';

export type Incident = IncidentData;

export async function fetchIncidents(): Promise<Incident[]> {
  return await apiFetchIncidents();
}

export async function updateIncident(incident: Incident): Promise<boolean> {
  return await apiUpdateIncident(incident);
}
