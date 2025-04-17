export interface Incident {
  idIncident: number;
  niveauIncident: number;
  intitule: string;
  date: string;
  heure: string;
  detailTechnique: string;
  autreRemarque: string | null;
  dateSolution: string | null;
  heureSolution: string | null;
  solutionApportee: string | null;
  conseilAVenir: string | null;
  status: boolean;
}

export async function fetchIncidents(): Promise<Incident[]> {
  try {
    const response = await fetch("https://linserv-info-01/~rl303414/S401/fetchIncidents.php");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des incidents", error);
    throw error;
  }
}

export async function updateIncident(incident: Incident): Promise<boolean> {
  try {
    const response = await fetch("https://linserv-info-01/~rl303414/S401/updateIncident.php", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incident),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'incident", error);
    throw error;
  }
} 
