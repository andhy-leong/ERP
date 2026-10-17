/**
 * Configuration de l'API et des serveurs de l'ERP
 * Permet de basculer facilement entre le mode autonome (MOCK / LocalStorage)
 * et votre futur serveur backend personnalisé.
 */

export interface ApiConfig {
  useMock: boolean;
  apiBaseUrl: string;
  timeout: number;
  endpoints: {
    auth: {
      login: string;
      logout: string;
    };
    caisse: {
      fetchProduits: string;
      fetchClients: string;
      insertTransaction: string;
      fetchTransactions: string;
    };
    pompes: {
      fetchPompes: string;
      fetchPompe: string;
      updateState: string;
      rembourser: string;
      fetchPrixCarburants: string;
      creerIncident: string;
    };
    produits: {
      fetchProduits: string;
      updateStock: string;
      addProduit: string;
    };
    incidents: {
      fetchIncidents: string;
      updateIncident: string;
      updateStatus: string;
      createIncident: string;
    };
    station: {
      getHours: string;
      updateHours: string;
      updateStatus: string;
    };
    employes: {
      fetchEmployes: string;
      addEmploye: string;
    };
    comptabilite: {
      getStats: string;
      addPerte: string;
      getBilans: string;
    };
  };
}

export const API_CONFIG: ApiConfig = {
  // Par défaut en mode MOCK pour fonctionner immédiatement sans serveur externe
  useMock: process.env.VUE_APP_USE_MOCK !== 'false',
  
  // URL de base de votre futur backend (configurable via fichier .env)
  apiBaseUrl: process.env.VUE_APP_API_BASE_URL || 'https://api.votre-erp.com/v1',
  
  timeout: 8000,
  
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout'
    },
    caisse: {
      fetchProduits: '/caisse/produits',
      fetchClients: '/caisse/clients',
      insertTransaction: '/caisse/transactions',
      fetchTransactions: '/caisse/transactions'
    },
    pompes: {
      fetchPompes: '/pompes',
      fetchPompe: '/pompes/:id',
      updateState: '/pompes/:id/state',
      rembourser: '/pompes/rembourser',
      fetchPrixCarburants: '/pompes/carburants/prix',
      creerIncident: '/pompes/incident'
    },
    produits: {
      fetchProduits: '/produits',
      updateStock: '/produits/:id/stock',
      addProduit: '/produits'
    },
    incidents: {
      fetchIncidents: '/incidents',
      updateIncident: '/incidents/:id',
      updateStatus: '/incidents/:id/status',
      createIncident: '/incidents'
    },
    station: {
      getHours: '/station/hours',
      updateHours: '/station/hours',
      updateStatus: '/station/status'
    },
    employes: {
      fetchEmployes: '/employes',
      addEmploye: '/employes'
    },
    comptabilite: {
      getStats: '/comptabilite/stats',
      addPerte: '/comptabilite/pertes',
      getBilans: '/comptabilite/bilans'
    }
  }
};
