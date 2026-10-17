/**
 * Base de données locale de démonstration pour l'ERP
 * Fournit toutes les données et permet un fonctionnement autonome (hors-ligne).
 */

export interface ProduitData {
  id: number;
  idProduit: number;
  codeProduit: number;
  nomProduit: string;
  categorie: string;
  qteEnStock: number;
  seuilCritique: number;
  unite: 'unite' | 'litre' | 'kg';
  prix: number;
  prixAchat: number;
  description: string;
}

export interface ClientData {
  idClient: number;
  nomClient: string;
  prenomClient: string;
  telephoneClient: string;
  emailClient: string;
  adresse: string;
  codePostal: string;
  ville: string;
  pays: string;
  soldeCarteEnergie: number;
  numeroCarteEnergie: string;
}

export interface IncidentData {
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

export interface PompeData {
  id: number;
  numero: number;
  type: 'Standard' | 'ELECTRIK';
  status: 'active' | 'in-use' | 'waiting-payment' | 'incident' | 'inactive';
  carburants: string[];
  selectedCarburant: string;
  details: {
    quantite: string;
    montant: string;
    carburant?: string;
  } | null;
  historique: {
    type: string;
    quantite: string;
    total: string;
    heure: string;
    typePaiement: string;
  }[];
  incident: {
    numero: number;
    details: string;
    niveau?: number;
  } | null;
  actions: {
    creer: boolean;
    arreter: boolean;
    payer: boolean;
    historique: boolean;
  };
}

export interface EmployeData {
  idEmploye: number;
  nom: string;
  prenom: string;
  identifiant: string;
  motDePasse: string;
  role: string;
  isGerant: number; // 1 = Gérant, 0 = Employé
  heureDebutTravail: string;
  heureFinTravail: string;
  email: string;
  telephone: string;
  actif: boolean;
}

export interface TransactionCaisseData {
  idTransaction: number;
  dateTransaction: string;
  heureTransaction: string;
  idClient: number | null;
  clientNom?: string;
  prixTotal: number;
  idEmploye: number;
  employeNom?: string;
  estRemboursement: boolean;
  produits: {
    idProduit: number;
    nomProduit: string;
    prix: number;
    qteAchete: number;
  }[];
  paiements: {
    mode: string;
    montant: number;
  }[];
}

export interface PerteData {
  idPerte: number;
  date: string;
  heure: string;
  motif: string;
  montant: number;
  auteur: string;
}

export const INITIAL_PRODUITS: ProduitData[] = [
  { id: 1, idProduit: 1, codeProduit: 1001, nomProduit: "SP95-E10 (Carburant)", categorie: "Carburants", qteEnStock: 12450, seuilCritique: 2000, unite: "litre", prix: 1.89, prixAchat: 1.45, description: "Carburant sans plomb contenant jusqu'à 10% de bioéthanol certifié." },
  { id: 2, idProduit: 2, codeProduit: 1002, nomProduit: "Gazole B7 (Diesel)", categorie: "Carburants", qteEnStock: 16800, seuilCritique: 3000, unite: "litre", prix: 1.78, prixAchat: 1.36, description: "Carburant diesel pour moteurs thermiques diesel standards et utilitaires." },
  { id: 3, idProduit: 3, codeProduit: 1003, nomProduit: "Superéthanol E85", categorie: "Carburants", qteEnStock: 3200, seuilCritique: 1500, unite: "litre", prix: 0.85, prixAchat: 0.60, description: "Carburant écologique contenant entre 65% et 85% de bioéthanol." },
  { id: 4, idProduit: 4, codeProduit: 1004, nomProduit: "SP98 Excellium Premium", categorie: "Carburants", qteEnStock: 7400, seuilCritique: 1500, unite: "litre", prix: 1.99, prixAchat: 1.55, description: "Sans-plomb haut de gamme avec additifs protecteurs pour moteur performant." },
  { id: 5, idProduit: 5, codeProduit: 2001, nomProduit: "Huile Moteur 5W30 Synthèse 1L", categorie: "Entretien Auto", qteEnStock: 22, seuilCritique: 5, unite: "unite", prix: 18.90, prixAchat: 8.50, description: "Huile moteur 100% synthèse universelle essence et diesel." },
  { id: 6, idProduit: 6, codeProduit: 2002, nomProduit: "Lave-glace Antigel -20°C 5L", categorie: "Entretien Auto", qteEnStock: 15, seuilCritique: 6, unite: "unite", prix: 7.90, prixAchat: 3.10, description: "Liquide lave-glace haute performance résistant au gel sévère." },
  { id: 7, idProduit: 7, codeProduit: 2003, nomProduit: "AdBlue Bidon 10L avec bec verseur", categorie: "Entretien Auto", qteEnStock: 12, seuilCritique: 4, unite: "unite", prix: 16.50, prixAchat: 8.20, description: "Solution de réduction des émissions polluantes pour diesels récents." },
  { id: 8, idProduit: 8, codeProduit: 2004, nomProduit: "Chiffon Microfibre Finition Pro", categorie: "Accessoires", qteEnStock: 3, seuilCritique: 5, unite: "unite", prix: 3.50, prixAchat: 1.10, description: "Microfibre absorbante sans rayures pour carrosserie et vitres." },
  { id: 9, idProduit: 9, codeProduit: 3001, nomProduit: "Café Expresso Lavazza Pur Arabica", categorie: "Boutique", qteEnStock: 120, seuilCritique: 20, unite: "unite", prix: 2.20, prixAchat: 0.35, description: "Café court intense servi à la machine professionnelle." },
  { id: 10, idProduit: 10, codeProduit: 3002, nomProduit: "Sandwich Club Jambon Emmental 230g", categorie: "Alimentation", qteEnStock: 4, seuilCritique: 8, unite: "unite", prix: 4.80, prixAchat: 2.10, description: "Sandwich frais du jour pain de mie céréales." },
  { id: 11, idProduit: 11, codeProduit: 3003, nomProduit: "Bouteille Eau Minérale 50cl", categorie: "Alimentation", qteEnStock: 54, seuilCritique: 15, unite: "unite", prix: 1.50, prixAchat: 0.30, description: "Bouteille eau de source naturelle fraîche." },
  { id: 12, idProduit: 12, codeProduit: 3004, nomProduit: "Canette Boisson Énergisante 250ml", categorie: "Alimentation", qteEnStock: 28, seuilCritique: 10, unite: "unite", prix: 2.90, prixAchat: 1.15, description: "Boisson rafraîchissante enrichie en vitamines et taurine." },
  { id: 13, idProduit: 13, codeProduit: 3005, nomProduit: "Croissant Pur Beurre Artisanal", categorie: "Alimentation", qteEnStock: 2, seuilCritique: 5, unite: "unite", prix: 1.40, prixAchat: 0.45, description: "Viennoiserie croustillante cuite sur place chaque matin." },
  { id: 14, idProduit: 14, codeProduit: 4001, nomProduit: "Forfait Lavage Rouleaux Haute Pression", categorie: "Services", qteEnStock: 999, seuilCritique: 0, unite: "unite", prix: 13.90, prixAchat: 1.20, description: "Programme complet mousse active, jantes, châssis et cire lustrante." }
];

export const INITIAL_CLIENTS: ClientData[] = [
  { idClient: 101, nomClient: "Dupuis", prenomClient: "Julien", telephoneClient: "06 12 34 56 78", emailClient: "j.dupuis@email.fr", adresse: "14 Avenue de la Libération", codePostal: "06000", ville: "Nice", pays: "France", soldeCarteEnergie: 45.50, numeroCarteEnergie: "CE-9843-0101" },
  { idClient: 102, nomClient: "Belkacem", prenomClient: "Amira", telephoneClient: "07 89 45 12 63", emailClient: "amira.b@pro-mail.com", adresse: "8 Rue Jean Médecin", codePostal: "06000", ville: "Nice", pays: "France", soldeCarteEnergie: 120.00, numeroCarteEnergie: "CE-7721-0102" },
  { idClient: 103, nomClient: "Lombard", prenomClient: "Charles", telephoneClient: "06 44 55 66 77", emailClient: "c.lombard@transport.fr", adresse: "23 Boulevard Gambetta", codePostal: "06000", ville: "Nice", pays: "France", soldeCarteEnergie: 310.25, numeroCarteEnergie: "CE-4412-0103" },
  { idClient: 104, nomClient: "Garnier", prenomClient: "Élodie", telephoneClient: "06 98 76 54 32", emailClient: "elodie.garnier@outlook.com", adresse: "5 Promenade des Anglais", codePostal: "06200", ville: "Nice", pays: "France", soldeCarteEnergie: 15.00, numeroCarteEnergie: "CE-1189-0104" },
  { idClient: 105, nomClient: "Morel", prenomClient: "Patrick", telephoneClient: "06 33 22 11 00", emailClient: "p.morel@artisan-plombier.fr", adresse: "12 Route de Grenoble", codePostal: "06200", ville: "Nice", pays: "France", soldeCarteEnergie: 85.40, numeroCarteEnergie: "CE-5534-0105" }
];

export const INITIAL_POMPES: PompeData[] = [
  {
    id: 1,
    numero: 1,
    type: "Standard",
    status: "active",
    carburants: ["SP95-E10", "Gazole B7", "SP98"],
    selectedCarburant: "SP95-E10",
    details: null,
    historique: [
      { type: "Carburant", quantite: "38.50 L", total: "72.77", heure: "08:15", typePaiement: "CB" },
      { type: "Carburant", quantite: "45.00 L", total: "85.05", heure: "07:42", typePaiement: "Carte Énergie" }
    ],
    incident: null,
    actions: { creer: true, arreter: false, payer: false, historique: true }
  },
  {
    id: 2,
    numero: 2,
    type: "Standard",
    status: "waiting-payment",
    carburants: ["SP95-E10", "Gazole B7", "SP98"],
    selectedCarburant: "Gazole B7",
    details: { quantite: "48.20", montant: "85.80", carburant: "Gazole B7" },
    historique: [
      { type: "Carburant", quantite: "52.10 L", total: "92.74", heure: "08:02", typePaiement: "CB" }
    ],
    incident: null,
    actions: { creer: true, arreter: false, payer: true, historique: true }
  },
  {
    id: 3,
    numero: 3,
    type: "Standard",
    status: "in-use",
    carburants: ["SP95-E10", "Gazole B7", "SP98"],
    selectedCarburant: "SP95-E10",
    details: { quantite: "26.40", montant: "49.90", carburant: "SP95-E10" },
    historique: [
      { type: "Carburant", quantite: "30.00 L", total: "56.70", heure: "07:20", typePaiement: "Espèces" }
    ],
    incident: null,
    actions: { creer: true, arreter: true, payer: false, historique: true }
  },
  {
    id: 4,
    numero: 4,
    type: "Standard",
    status: "active",
    carburants: ["Superéthanol E85", "SP95-E10"],
    selectedCarburant: "Superéthanol E85",
    details: null,
    historique: [
      { type: "Carburant", quantite: "42.00 L", total: "35.70", heure: "08:24", typePaiement: "CB" }
    ],
    incident: null,
    actions: { creer: true, arreter: false, payer: false, historique: true }
  },
  {
    id: 5,
    numero: 5,
    type: "Standard",
    status: "incident",
    carburants: ["Gazole B7", "AdBlue"],
    selectedCarburant: "Gazole B7",
    details: null,
    historique: [],
    incident: {
      numero: 201,
      details: "Alerte pression capteur pistolet Gazole",
      niveau: 2
    },
    actions: { creer: true, arreter: false, payer: false, historique: true }
  },
  {
    id: 6,
    numero: 6,
    type: "ELECTRIK",
    status: "active",
    carburants: ["Superchargeur 150 kW", "Prise Combo CCS"],
    selectedCarburant: "Superchargeur 150 kW",
    details: null,
    historique: [
      { type: "Charge Électrique", quantite: "34.50 kWh", total: "15.52", heure: "07:55", typePaiement: "CB" }
    ],
    incident: null,
    actions: { creer: true, arreter: false, payer: false, historique: true }
  }
];

export const INITIAL_INCIDENTS: IncidentData[] = [
  {
    idIncident: 1,
    niveauIncident: 2,
    intitule: "Anomalie débit Pompe 5",
    date: new Date().toISOString().split('T')[0],
    heure: "07:45:00",
    detailTechnique: "Baisse de pression anormale constatée sur le pistolet diesel de la pompe 5. Mise en sécurité automatique.",
    autreRemarque: "Le filtre carburant pourrait nécessiter un détartrage ou un remplacement de crépine.",
    dateSolution: null,
    heureSolution: null,
    solutionApportee: null,
    conseilAVenir: "Inspection du technicien planifiée ce matin.",
    status: false
  },
  {
    idIncident: 2,
    niveauIncident: 1,
    intitule: "Bourrage papier imprimante caisse 1",
    date: new Date().toISOString().split('T')[0],
    heure: "06:30:00",
    detailTechnique: "Rouleau thermique mal inséré lors du changement de caisse.",
    autreRemarque: "Débloqué sans dommage.",
    dateSolution: new Date().toISOString().split('T')[0],
    heureSolution: "06:40:00",
    solutionApportee: "Réalignement de l'axe et réinitialisation de la tête d'impression.",
    conseilAVenir: "Veiller à fermer le capot avec un clic audible.",
    status: true
  },
  {
    idIncident: 3,
    niveauIncident: 3,
    intitule: "Coupure temporaire réseau TPE CB",
    date: "2026-10-15",
    heure: "14:10:00",
    detailTechnique: "Perte de connexion 4G/Fibre du terminal bancaire secondaire.",
    autreRemarque: "Les paiements ont basculé temporairement en mode secours offline.",
    dateSolution: "2026-10-15",
    heureSolution: "14:32:00",
    solutionApportee: "Redémarrage du routeur passerelle monétique sécurisée.",
    conseilAVenir: "Vérifier le câble RJ45 de secours.",
    status: true
  }
];

export const INITIAL_EMPLOYES: EmployeData[] = [
  {
    idEmploye: 1,
    identifiant: "admin",
    motDePasse: "admin123",
    nom: "Martin",
    prenom: "Alexandre",
    role: "Directeur de Station / Gérant",
    isGerant: 1,
    heureDebutTravail: "07:00",
    heureFinTravail: "17:30",
    email: "a.martin@station-erp.fr",
    telephone: "06 10 20 30 40",
    actif: true
  },
  {
    idEmploye: 2,
    identifiant: "gerant",
    motDePasse: "gerant123",
    nom: "Lemoine",
    prenom: "Sophie",
    role: "Responsable Adjointe & Comptabilité",
    isGerant: 1,
    heureDebutTravail: "08:00",
    heureFinTravail: "16:30",
    email: "s.lemoine@station-erp.fr",
    telephone: "06 22 33 44 55",
    actif: true
  },
  {
    idEmploye: 3,
    identifiant: "employe",
    motDePasse: "employe123",
    nom: "Dupont",
    prenom: "Pierre",
    role: "Caissier & Opérateur Station",
    isGerant: 0,
    heureDebutTravail: "06:00",
    heureFinTravail: "14:00",
    email: "p.dupont@station-erp.fr",
    telephone: "06 55 66 77 88",
    actif: true
  },
  {
    idEmploye: 4,
    identifiant: "caissier",
    motDePasse: "caissier123",
    nom: "Moreau",
    prenom: "Julien",
    role: "Opérateur Boutique & Caisse",
    isGerant: 0,
    heureDebutTravail: "13:30",
    heureFinTravail: "21:30",
    email: "j.moreau@station-erp.fr",
    telephone: "07 11 22 33 44",
    actif: true
  }
];

export const INITIAL_TRANSACTIONS: TransactionCaisseData[] = [
  {
    idTransaction: 5001,
    dateTransaction: new Date().toISOString().split('T')[0],
    heureTransaction: "08:35:12",
    idClient: 101,
    clientNom: "Julien Dupuis",
    prixTotal: 78.62,
    idEmploye: 3,
    employeNom: "Pierre Dupont",
    estRemboursement: false,
    produits: [
      { idProduit: 1, nomProduit: "SP95-E10 (Carburant)", prix: 1.89, qteAchete: 38 },
      { idProduit: 9, nomProduit: "Café Expresso Lavazza Pur Arabica", prix: 2.20, qteAchete: 1 },
      { idProduit: 13, nomProduit: "Croissant Pur Beurre Artisanal", prix: 1.40, qteAchete: 1 }
    ],
    paiements: [{ mode: "Carte Bancaire", montant: 78.62 }]
  },
  {
    idTransaction: 5002,
    dateTransaction: new Date().toISOString().split('T')[0],
    heureTransaction: "08:14:40",
    idClient: 102,
    clientNom: "Amira Belkacem",
    prixTotal: 34.50,
    idEmploye: 3,
    employeNom: "Pierre Dupont",
    estRemboursement: false,
    produits: [
      { idProduit: 5, nomProduit: "Huile Moteur 5W30 Synthèse 1L", prix: 18.90, qteAchete: 1 },
      { idProduit: 6, nomProduit: "Lave-glace Antigel -20°C 5L", prix: 7.90, qteAchete: 1 },
      { idProduit: 10, nomProduit: "Sandwich Club Jambon Emmental 230g", prix: 4.80, qteAchete: 1 },
      { idProduit: 12, nomProduit: "Canette Boisson Énergisante 250ml", prix: 2.90, qteAchete: 1 }
    ],
    paiements: [{ mode: "Carte Énergie", montant: 34.50 }]
  },
  {
    idTransaction: 5003,
    dateTransaction: new Date().toISOString().split('T')[0],
    heureTransaction: "07:50:22",
    idClient: null,
    clientNom: "Client de passage",
    prixTotal: 15.40,
    idEmploye: 3,
    employeNom: "Pierre Dupont",
    estRemboursement: false,
    produits: [
      { idProduit: 14, nomProduit: "Forfait Lavage Rouleaux Haute Pression", prix: 13.90, qteAchete: 1 },
      { idProduit: 11, nomProduit: "Bouteille Eau Minérale 50cl", prix: 1.50, qteAchete: 1 }
    ],
    paiements: [{ mode: "Espèces", montant: 15.40 }]
  }
];

export const INITIAL_PERTES: PerteData[] = [
  { idPerte: 1, date: new Date().toISOString().split('T')[0], heure: "07:15", motif: "Viennoiseries date dépassée", montant: 8.40, auteur: "Pierre Dupont" },
  { idPerte: 2, date: new Date().toISOString().split('T')[0], heure: "08:00", motif: "Bidon lave-glace percé manutention", montant: 7.90, auteur: "Alexandre Martin" }
];

export const INITIAL_STATION_HOURS: Record<string, { ouverture: string; fermeture: string }> = {
  Lundi: { ouverture: "06:00", fermeture: "22:00" },
  Mardi: { ouverture: "06:00", fermeture: "22:00" },
  Mercredi: { ouverture: "06:00", fermeture: "22:00" },
  Jeudi: { ouverture: "06:00", fermeture: "22:00" },
  Vendredi: { ouverture: "06:00", fermeture: "23:00" },
  Samedi: { ouverture: "06:30", fermeture: "23:00" },
  Dimanche: { ouverture: "07:00", fermeture: "21:00" }
};
