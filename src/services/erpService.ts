import { API_CONFIG } from '@/config/api.config';
import {
  INITIAL_PRODUITS,
  INITIAL_CLIENTS,
  INITIAL_POMPES,
  INITIAL_INCIDENTS,
  INITIAL_EMPLOYES,
  INITIAL_TRANSACTIONS,
  INITIAL_PERTES,
  INITIAL_STATION_HOURS,
  ProduitData,
  ClientData,
  IncidentData,
  PompeData,
  EmployeData,
  TransactionCaisseData,
  PerteData
} from '@/data/mockDatabase';

const STORAGE_KEYS = {
  PRODUITS: 'erp_produits',
  CLIENTS: 'erp_clients',
  POMPES: 'erp_pompes',
  INCIDENTS: 'erp_incidents',
  EMPLOYES: 'erp_employes',
  TRANSACTIONS: 'erp_transactions',
  PERTES: 'erp_pertes',
  STATION_OPEN: 'erp_station_open',
  STATION_HOURS: 'erp_station_hours'
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Erreur lecture storage key ${key}`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Erreur sauvegarde storage key ${key}`, e);
  }
}

// Initialisation au chargement
export function initErpStorage(): void {
  getFromStorage(STORAGE_KEYS.PRODUITS, INITIAL_PRODUITS);
  getFromStorage(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  getFromStorage(STORAGE_KEYS.POMPES, INITIAL_POMPES);
  getFromStorage(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
  getFromStorage(STORAGE_KEYS.EMPLOYES, INITIAL_EMPLOYES);
  getFromStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  getFromStorage(STORAGE_KEYS.PERTES, INITIAL_PERTES);
  getFromStorage(STORAGE_KEYS.STATION_HOURS, INITIAL_STATION_HOURS);
  if (localStorage.getItem(STORAGE_KEYS.STATION_OPEN) === null) {
    localStorage.setItem(STORAGE_KEYS.STATION_OPEN, 'true');
  }
}

// Initialise immédiatement
initErpStorage();

// ==========================================
// 1. AUTHENTIFICATION & UTILISATEURS
// ==========================================
export async function loginUser(identifiant: string, mdp: string): Promise<{
  success: boolean;
  user?: {
    idEmploye: number;
    identifiant: string;
    nom: string;
    prenom: string;
    isGerant: number;
    role: string;
  };
  error?: string;
}> {
  if (!API_CONFIG.useMock) {
    try {
      const response = await fetch(`${API_CONFIG.apiBaseUrl}${API_CONFIG.endpoints.auth.login}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifiant, password: mdp })
      });
      const data = await response.json();
      if (data.idEmploye || data.success) {
        return {
          success: true,
          user: {
            idEmploye: data.idEmploye,
            identifiant,
            nom: data.nom,
            prenom: data.prenom,
            isGerant: data.estGerant ?? (data.isGerant ? 1 : 0),
            role: data.role || (data.estGerant ? 'Gérant' : 'Employé')
          }
        };
      }
      return { success: false, error: data.error || 'Identifiants incorrects' };
    } catch (err) {
      console.error('Erreur API login:', err);
      return { success: false, error: 'Serveur distant inaccessible' };
    }
  }

  // Mode MOCK
  const employes = getFromStorage<EmployeData[]>(STORAGE_KEYS.EMPLOYES, INITIAL_EMPLOYES);
  const found = employes.find(e => 
    e.identifiant.toLowerCase() === identifiant.toLowerCase() && 
    e.motDePasse === mdp && 
    e.actif
  );

  if (found) {
    return {
      success: true,
      user: {
        idEmploye: found.idEmploye,
        identifiant: found.identifiant,
        nom: found.nom,
        prenom: found.prenom,
        isGerant: found.isGerant,
        role: found.role
      }
    };
  }
  return { success: false, error: 'Identifiant ou mot de passe incorrect' };
}

// ==========================================
// 2. GESTION DES PRODUITS ET DU STOCK
// ==========================================
export async function fetchProduits(): Promise<ProduitData[]> {
  if (!API_CONFIG.useMock) {
    const res = await fetch(`${API_CONFIG.apiBaseUrl}${API_CONFIG.endpoints.produits.fetchProduits}`);
    return await res.json();
  }
  return getFromStorage<ProduitData[]>(STORAGE_KEYS.PRODUITS, INITIAL_PRODUITS);
}

export async function addProduit(produit: Omit<ProduitData, 'id' | 'idProduit'>): Promise<ProduitData> {
  const produits = await fetchProduits();
  const nextId = produits.length > 0 ? Math.max(...produits.map(p => p.id)) + 1 : 1;
  const newProduit: ProduitData = {
    ...produit,
    id: nextId,
    idProduit: nextId
  };
  produits.push(newProduit);
  saveToStorage(STORAGE_KEYS.PRODUITS, produits);
  return newProduit;
}

export async function updateStockProduit(idProduit: number, deltaQuantite: number): Promise<boolean> {
  const produits = await fetchProduits();
  const index = produits.findIndex(p => p.idProduit === idProduit || p.id === idProduit);
  if (index !== -1) {
    produits[index].qteEnStock += deltaQuantite;
    if (produits[index].qteEnStock < 0) produits[index].qteEnStock = 0;
    saveToStorage(STORAGE_KEYS.PRODUITS, produits);
    return true;
  }
  return false;
}

// ==========================================
// 3. CAISSE & TRANSACTIONS
// ==========================================
export async function fetchClients(query = ''): Promise<ClientData[]> {
  if (!API_CONFIG.useMock) {
    const res = await fetch(`${API_CONFIG.apiBaseUrl}${API_CONFIG.endpoints.caisse.fetchClients}?searchQuery=${encodeURIComponent(query)}`);
    return await res.json();
  }
  const clients = getFromStorage<ClientData[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  if (!query || query.trim() === '') return clients;
  const q = query.toLowerCase().trim();
  return clients.filter(c => 
    c.nomClient.toLowerCase().includes(q) ||
    c.prenomClient.toLowerCase().includes(q) ||
    c.telephoneClient.includes(q) ||
    c.emailClient.toLowerCase().includes(q) ||
    c.idClient.toString().includes(q) ||
    c.numeroCarteEnergie.toLowerCase().includes(q)
  );
}

export async function saveClient(client: Omit<ClientData, 'idClient'>): Promise<ClientData> {
  const clients = getFromStorage<ClientData[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  const nextId = clients.length > 0 ? Math.max(...clients.map(c => c.idClient)) + 1 : 101;
  const newClient: ClientData = {
    ...client,
    idClient: nextId,
    numeroCarteEnergie: client.numeroCarteEnergie || `CE-${Math.floor(1000 + Math.random() * 9000)}-0${nextId}`
  };
  clients.push(newClient);
  saveToStorage(STORAGE_KEYS.CLIENTS, clients);
  return newClient;
}

export async function insertTransactionCaisse(transaction: {
  dateTransaction: string;
  heureTransaction: string;
  idClient: number | null;
  prixTotal: number;
  idEmploye: number;
  estRemboursement?: boolean;
  produits: { idProduit: number; qteAchete: number; nomProduit?: string; prix?: number }[];
  paiements: { modePaiement?: string; mode?: string; montant: number }[];
}): Promise<{ success: boolean; idTransaction: number }> {
  if (!API_CONFIG.useMock) {
    const res = await fetch(`${API_CONFIG.apiBaseUrl}${API_CONFIG.endpoints.caisse.insertTransaction}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    return await res.json();
  }

  const transactions = getFromStorage<TransactionCaisseData[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  const nextId = transactions.length > 0 ? Math.max(...transactions.map(t => t.idTransaction)) + 1 : 5001;
  
  // Mettre à jour les stocks des produits vendus
  const allProduits = await fetchProduits();
  for (const item of transaction.produits) {
    await updateStockProduit(item.idProduit, -item.qteAchete);
  }

  // Déduire du solde de la carte énergie si paiement en carte énergie
  const carteEnergiePaiement = transaction.paiements.find(p => (p.modePaiement || p.mode) === 'Carte Énergie');
  if (carteEnergiePaiement && transaction.idClient) {
    const clients = getFromStorage<ClientData[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    const client = clients.find(c => c.idClient === transaction.idClient);
    if (client) {
      client.soldeCarteEnergie = Math.max(0, client.soldeCarteEnergie - carteEnergiePaiement.montant);
      saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    }
  }

  const newTx: TransactionCaisseData = {
    idTransaction: nextId,
    dateTransaction: transaction.dateTransaction,
    heureTransaction: transaction.heureTransaction,
    idClient: transaction.idClient,
    prixTotal: transaction.prixTotal,
    idEmploye: transaction.idEmploye,
    estRemboursement: !!transaction.estRemboursement,
    produits: transaction.produits.map(p => {
      const found = allProduits.find(prod => prod.idProduit === p.idProduit);
      return {
        idProduit: p.idProduit,
        nomProduit: p.nomProduit || (found ? found.nomProduit : `Article #${p.idProduit}`),
        prix: p.prix || (found ? found.prix : 0),
        qteAchete: p.qteAchete
      };
    }),
    paiements: transaction.paiements.map(p => ({
      mode: p.modePaiement || p.mode || 'Espèces',
      montant: p.montant
    }))
  };

  transactions.unshift(newTx);
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);

  return { success: true, idTransaction: nextId };
}

export async function fetchTransactions(): Promise<TransactionCaisseData[]> {
  return getFromStorage<TransactionCaisseData[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
}

// ==========================================
// 4. POMPES & CARBURANTS
// ==========================================
export async function fetchPompes(): Promise<PompeData[]> {
  if (!API_CONFIG.useMock) {
    const res = await fetch(`${API_CONFIG.apiBaseUrl}${API_CONFIG.endpoints.pompes.fetchPompes}`);
    return await res.json();
  }
  return getFromStorage<PompeData[]>(STORAGE_KEYS.POMPES, INITIAL_POMPES);
}

export async function fetchPompe(id: number): Promise<PompeData | null> {
  const pompes = await fetchPompes();
  return pompes.find(p => p.id === id || p.numero === id) || null;
}

export async function updatePompeState(pompeId: number, state: PompeData['status'], details: any = null): Promise<boolean> {
  const pompes = await fetchPompes();
  const pompe = pompes.find(p => p.id === pompeId || p.numero === pompeId);
  if (!pompe) return false;

  pompe.status = state;
  if (details !== null) {
    pompe.details = details;
  }
  if (state === 'active') {
    pompe.details = null;
    pompe.actions.arreter = false;
    pompe.actions.payer = false;
  } else if (state === 'in-use') {
    pompe.actions.arreter = true;
    pompe.actions.payer = false;
  } else if (state === 'waiting-payment') {
    pompe.actions.arreter = false;
    pompe.actions.payer = true;
  }

  saveToStorage(STORAGE_KEYS.POMPES, pompes);
  return true;
}

export async function rembourserPompe(pompeId: number, mode: string, montant: number): Promise<boolean> {
  const pompes = await fetchPompes();
  const pompe = pompes.find(p => p.id === pompeId || p.numero === pompeId);
  if (!pompe) return false;

  // Remet la pompe en service active
  pompe.status = 'active';
  pompe.details = null;
  pompe.actions.arreter = false;
  pompe.actions.payer = false;

  // Enregistre dans l'historique
  pompe.historique.unshift({
    type: "Remboursement",
    quantite: "0 L",
    total: `-${montant.toFixed(2)}`,
    heure: new Date().toLocaleTimeString().slice(0, 5),
    typePaiement: mode
  });

  saveToStorage(STORAGE_KEYS.POMPES, pompes);

  // Enregistre une perte ou transaction négative
  await addPerte(`Remboursement carburant non servi Pompe ${pompeId} (${mode})`, montant, 'Opérateur Station');

  return true;
}

export async function creerIncidentPompe(pompeId: number, description: string, niveau: number): Promise<boolean> {
  const pompes = await fetchPompes();
  const pompe = pompes.find(p => p.id === pompeId || p.numero === pompeId);
  if (pompe) {
    pompe.status = 'incident';
    pompe.incident = {
      numero: Math.floor(100 + Math.random() * 900),
      details: description,
      niveau
    };
    saveToStorage(STORAGE_KEYS.POMPES, pompes);
  }

  // Crée l'incident dans le registre global des incidents
  await createIncident({
    intitule: `Incident Pompe ${pompeId}: ${description.slice(0, 30)}...`,
    niveauIncident: Number(niveau),
    detailTechnique: description,
    date: new Date().toISOString().split('T')[0],
    heure: new Date().toLocaleTimeString(),
    autreRemarque: `Généré automatiquement depuis l'interface Pompe ${pompeId}`,
    dateSolution: null,
    heureSolution: null,
    solutionApportee: null,
    conseilAVenir: null,
    status: false
  });

  return true;
}

// ==========================================
// 5. INCIDENTS
// ==========================================
export async function fetchIncidents(): Promise<IncidentData[]> {
  if (!API_CONFIG.useMock) {
    const res = await fetch(`${API_CONFIG.apiBaseUrl}${API_CONFIG.endpoints.incidents.fetchIncidents}`);
    return await res.json();
  }
  return getFromStorage<IncidentData[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
}

export async function createIncident(incident: Omit<IncidentData, 'idIncident'>): Promise<IncidentData> {
  const incidents = await fetchIncidents();
  const nextId = incidents.length > 0 ? Math.max(...incidents.map(i => i.idIncident)) + 1 : 1;
  const newIncident: IncidentData = {
    ...incident,
    idIncident: nextId
  };
  incidents.unshift(newIncident);
  saveToStorage(STORAGE_KEYS.INCIDENTS, incidents);
  return newIncident;
}

export async function updateIncident(incident: IncidentData): Promise<boolean> {
  const incidents = await fetchIncidents();
  const index = incidents.findIndex(i => i.idIncident === incident.idIncident);
  if (index !== -1) {
    incidents[index] = { ...incident };
    saveToStorage(STORAGE_KEYS.INCIDENTS, incidents);
    return true;
  }
  return false;
}

// ==========================================
// 6. GESTION DES EMPLOYÉS
// ==========================================
export async function fetchEmployes(): Promise<EmployeData[]> {
  if (!API_CONFIG.useMock) {
    const res = await fetch(`${API_CONFIG.apiBaseUrl}${API_CONFIG.endpoints.employes.fetchEmployes}`);
    return await res.json();
  }
  return getFromStorage<EmployeData[]>(STORAGE_KEYS.EMPLOYES, INITIAL_EMPLOYES);
}

export async function addEmploye(emp: Omit<EmployeData, 'idEmploye'>): Promise<EmployeData> {
  const employes = await fetchEmployes();
  const nextId = employes.length > 0 ? Math.max(...employes.map(e => e.idEmploye)) + 1 : 1;
  const newEmp: EmployeData = {
    ...emp,
    idEmploye: nextId
  };
  employes.push(newEmp);
  saveToStorage(STORAGE_KEYS.EMPLOYES, employes);
  return newEmp;
}

// ==========================================
// 7. COMPTABILITÉ, PERTES ET STATS ERP
// ==========================================
export async function fetchPertes(): Promise<PerteData[]> {
  return getFromStorage<PerteData[]>(STORAGE_KEYS.PERTES, INITIAL_PERTES);
}

export async function addPerte(motif: string, montant: number, auteur = 'Gérant'): Promise<boolean> {
  const pertes = await fetchPertes();
  const nextId = pertes.length > 0 ? Math.max(...pertes.map(p => p.idPerte)) + 1 : 1;
  pertes.unshift({
    idPerte: nextId,
    date: new Date().toISOString().split('T')[0],
    heure: new Date().toLocaleTimeString().slice(0, 5),
    motif,
    montant,
    auteur
  });
  saveToStorage(STORAGE_KEYS.PERTES, pertes);
  return true;
}

export async function getComptabiliteStats(): Promise<{
  chiffreAffaires: number;
  totalPertes: number;
  tresorerie: number;
  nombreVentes: number;
  panierMoyen: number;
  margeEstimee: number;
}> {
  const transactions = await fetchTransactions();
  const pertes = await fetchPertes();

  const ca = transactions.reduce((sum, tx) => sum + (tx.estRemboursement ? -tx.prixTotal : tx.prixTotal), 0);
  const totalPertes = pertes.reduce((sum, p) => sum + p.montant, 0);
  const baseTresorerie = 35000; // Fonds de roulement initial station
  const tresorerie = baseTresorerie + ca - totalPertes;
  const nombreVentes = transactions.length;
  const panierMoyen = nombreVentes > 0 ? ca / nombreVentes : 0;
  const margeEstimee = ca * 0.28; // Marge moyenne constatée en station

  return {
    chiffreAffaires: Math.round(ca * 100) / 100,
    totalPertes: Math.round(totalPertes * 100) / 100,
    tresorerie: Math.round(tresorerie * 100) / 100,
    nombreVentes,
    panierMoyen: Math.round(panierMoyen * 100) / 100,
    margeEstimee: Math.round(margeEstimee * 100) / 100
  };
}

// ==========================================
// 8. ÉTAT ET HORAIRES DE LA STATION
// ==========================================
export function getStationStatus(): boolean {
  return localStorage.getItem(STORAGE_KEYS.STATION_OPEN) !== 'false';
}

export function setStationStatus(isOpen: boolean): void {
  localStorage.setItem(STORAGE_KEYS.STATION_OPEN, isOpen ? 'true' : 'false');
}

export function getStationHours(day: string): { ouverture: string; fermeture: string } {
  const hours = getFromStorage<Record<string, { ouverture: string; fermeture: string }>>(
    STORAGE_KEYS.STATION_HOURS,
    INITIAL_STATION_HOURS
  );
  return hours[day] || { ouverture: "06:00", fermeture: "22:00" };
}

export function updateStationHours(day: string, ouverture: string, fermeture: string): void {
  const hours = getFromStorage<Record<string, { ouverture: string; fermeture: string }>>(
    STORAGE_KEYS.STATION_HOURS,
    INITIAL_STATION_HOURS
  );
  hours[day] = { ouverture, fermeture };
  saveToStorage(STORAGE_KEYS.STATION_HOURS, hours);
}
