<template>
  <GridItem>
  <div class="liste-pompes-container" ref="pompeContainer" style="grid-area: 1 / 1 / span 4 / span 6;">
    <div class="pompes-scroll-container">
      <div class="pompes-row">
        <PompeComponent 
          v-for="pompe in pompes" 
          :key="pompe.id" 
          :pompeId="pompe.id"
          :carburantsList="getCarburantsForPompe(pompe.id)"
          @open-modal="openModal"
        />
      </div>
    </div>
    
    <!-- Modal de confirmation pour arrêter/rembourser -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Remboursement nécessaire</h3>
        </div>
        <div class="modal-body">
          <p>La pompe était encore en utilisation. Il reste {{ modalData.carburantRestant }} de carburant utilisable.</p>
          <p>Choisissez la méthode de remboursement :</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Annuler</button>
          <button class="btn btn-primary" @click="rembourserEspece">Rembourser en espèce</button>
          <button class="btn btn-primary" @click="rembourserCredit">Rembourser en crédit énergie</button>
          <button class="btn btn-primary" @click="rembourserCB">Rembourser en CB</button>
        </div>
      </div>
    </div>
  </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import PompeComponent from './PompeComponent.vue';
import GridItem from "@/components/GridItem.vue";

// Définir l'interface pour les pompes
interface Pompe {
  id: number;
  type?: string;
  carburants?: string[];
  status: string;
  details: any;
  actions?: {
    payer: boolean;
    arreter: boolean;
  };
}

// Définir l'interface pour les données de la modal
interface ModalData {
  pompeId: number | null;
  carburantRestant: string;
  idCarburant: number | null;
}

// eslint-disable-next-line no-undef
const emit = defineEmits(['retour']);

// Variables réactives
const pompes = ref<Pompe[]>([]);
const showModal = ref(false);
const modalData = ref<ModalData>({
  pompeId: null,
  carburantRestant: '0',
  idCarburant: null
});
const carburantsMap = ref<Map<number, string[]>>(new Map());
const pompeContainer = ref(null);

// Fonction pour récupérer la liste des pompes depuis la BD
const fetchPompes = async () => {
  try {
    console.log('Récupération des pompes depuis l\'API...');
    const response = await fetch('https://linserv-info-01/~lm308981/S401/fetchPompes.php');
    console.log('Réponse de l\'API reçue');
    
    const data = await response.json();
    console.log('Données reçues:', data);
    
    if (Array.isArray(data)) {
      pompes.value = data;
      console.log(`${data.length} pompes récupérées`);
      
      // Stocker les carburants disponibles pour chaque pompe
      data.forEach(pompe => {
        if (pompe.id && pompe.carburants) {
          carburantsMap.value.set(pompe.id, pompe.carburants);
          console.log(`Pompe ${pompe.id}: ${pompe.carburants.length} carburants disponibles`);
        }
      });
    } else {
      console.error("Format de données incorrect:", data);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des pompes", error);
  }
};

const getCarburantsForPompe = (pompeId: number) => {
  return carburantsMap.value.get(pompeId) || [];
};

const openModal = (pompeId: number) => {
  console.log(`Réinitialisation simple de la pompe ${pompeId}`);
  
  // Réinitialiser directement la pompe sans ouvrir le modal
  resetPompeState(pompeId);
};

const closeModal = () => {
  showModal.value = false;
};

// Nouvelle fonction pour réinitialiser l'état d'une pompe
const resetPompeState = (pompeId: number) => {
  console.log(`Réinitialisation de l'état de la pompe ${pompeId}`);
  
  // 1. Mise à jour locale
  const pompeIndex = pompes.value.findIndex(p => p.id === pompeId);
  if (pompeIndex >= 0) {
    pompes.value[pompeIndex].status = 'active';
    pompes.value[pompeIndex].details = null;
    
    if (pompes.value[pompeIndex].actions) {
      pompes.value[pompeIndex].actions.payer = false;
      pompes.value[pompeIndex].actions.arreter = false;
    }
  }
  
  // 2. Mise à jour dans localStorage
  const pompeKey = `pompe_${pompeId}`;
  try {
    const pompeData = JSON.parse(localStorage.getItem(pompeKey) || '{}');
    pompeData.status = 'active';
    pompeData.details = null;
    pompeData.selectedCarburant = '';
    
    if (pompeData.actions) {
      pompeData.actions.payer = false;
      pompeData.actions.arreter = false;
    }
    
    localStorage.setItem(pompeKey, JSON.stringify(pompeData));
  } catch (e) {
    console.error("Erreur lors de la mise à jour du localStorage", e);
  }
  
  // 3. Mise à jour dans la base de données
  fetch(`https://linserv-info-01/~lm308981/S401/updatePompeState.php?pompeId=${pompeId}&state=active`, {
    method: 'GET'
  })
  .then(response => response.json())
  .then(data => {
    console.log(`État de la pompe ${pompeId} mis à jour:`, data);
    // Rafraîchir les données
    fetchPompes();
  })
  .catch(error => {
    console.error("Erreur lors de la mise à jour de l'état de la pompe", error);
  });
};

const rembourserEspece = async () => {
  if (!modalData.value.pompeId) return;
  
  try {
    console.log(`Remboursement en espèce pour la pompe ${modalData.value.pompeId}`);
    
    // Récupérer l'ID de l'employé connecté
    let userData = null;
    try {
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        userData = JSON.parse(userDataStr);
        console.log('Données utilisateur récupérées:', userData);
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des données utilisateur:", e);
    }
    
    const idEmploye = userData?.idEmploye || 1; // Utiliser 1 par défaut si aucun employé n'est connecté
    
    const response = await fetch('https://linserv-info-01/~lm308981/S401/rembourserPompe.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pompeId: modalData.value.pompeId,
        methode: 'espece',
        montant: parseFloat(modalData.value.carburantRestant) || 0,
        idEmploye: idEmploye,
        idCarburant: modalData.value.idCarburant
      }),
    });
    
    const data = await response.json();
    console.log('Réponse du remboursement:', data);
    
    if (data.success) {
      resetPompeState(modalData.value.pompeId);
      alert("Remboursement effectué avec succès !");
      await fetchPompes();
    } else {
      alert(`Erreur lors du remboursement: ${data.error}`);
    }
    
    closeModal();
  } catch (error) {
    console.error("Erreur lors du remboursement", error);
  }
};

const rembourserCredit = async () => {
  if (!modalData.value.pompeId) return;
  
  try {
    console.log(`Remboursement en crédit pour la pompe ${modalData.value.pompeId}`);
    
    // Récupérer l'ID de l'employé connecté
    let userData = null;
    try {
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        userData = JSON.parse(userDataStr);
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des données utilisateur:", e);
    }
    
    const idEmploye = userData?.idEmploye || 1;
    
    const response = await fetch('https://linserv-info-01/~lm308981/S401/rembourserPompe.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pompeId: modalData.value.pompeId,
        methode: 'credit',
        montant: parseFloat(modalData.value.carburantRestant) || 0,
        idEmploye: idEmploye,
        idCarburant: modalData.value.idCarburant
      }),
    });
    
    const data = await response.json();
    console.log('Réponse du remboursement:', data);
    
    if (data.success) {
      resetPompeState(modalData.value.pompeId);
      alert("Remboursement effectué avec succès !");
      await fetchPompes();
    } else {
      alert(`Erreur lors du remboursement: ${data.error}`);
    }
    
    closeModal();
  } catch (error) {
    console.error("Erreur lors du remboursement", error);
  }
};

const rembourserCB = async () => {
  if (!modalData.value.pompeId) return;
  
  try {
    console.log(`Remboursement par CB pour la pompe ${modalData.value.pompeId}`);
    
    // Récupérer l'ID de l'employé connecté
    let userData = null;
    try {
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        userData = JSON.parse(userDataStr);
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des données utilisateur:", e);
    }
    
    const idEmploye = userData?.idEmploye || 1;
    
    const response = await fetch('https://linserv-info-01/~lm308981/S401/rembourserPompe.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pompeId: modalData.value.pompeId,
        methode: 'cb',
        montant: parseFloat(modalData.value.carburantRestant) || 0,
        idEmploye: idEmploye,
        idCarburant: modalData.value.idCarburant
      }),
    });
    
    const data = await response.json();
    console.log('Réponse du remboursement:', data);
    
    if (data.success) {
      resetPompeState(modalData.value.pompeId);
      alert("Remboursement effectué avec succès !");
      await fetchPompes();
    } else {
      alert(`Erreur lors du remboursement: ${data.error}`);
    }
    
    closeModal();
  } catch (error) {
    console.error("Erreur lors du remboursement", error);
  }
};

// Gestionnaire pour détecter les clics en dehors du conteneur
const handleOutsideClick = (event: MouseEvent) => {
  if (pompeContainer.value && !pompeContainer.value.contains(event.target as Node)) {
    console.log('Clic détecté en dehors du conteneur de pompes');
    emit('retour');
  }
};

onMounted(() => {
  console.log('Composant ListePompeExtended monté, récupération des pompes...');
  fetchPompes();
  
  // Ajouter le gestionnaire de clic au document
  document.addEventListener('mousedown', handleOutsideClick);
});

onUnmounted(() => {
  // Supprimer le gestionnaire de clic lors du démontage du composant
  document.removeEventListener('mousedown', handleOutsideClick);
});
</script>

<style scoped>
.liste-pompes-container {
  width: 100%;
  display: flex;
  padding: 0;
  margin: 0;
  position: relative; /* Pour s'assurer que les événements de clic sont correctement capturés */
  z-index: 1;
}

.pompes-scroll-container {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid #454D5E;
  border-radius: 12px;
  background-color: #EDF0F7;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.pompes-row {
  display: flex;
  padding: 20px;
  width: fit-content;  /* Pour s'adapter au contenu */
  min-width: 100%;
}

.pompes-row > * {
  flex: 0 0 320px; /* Largeur fixe pour chaque pompe */
  margin-right: 20px;
  height: 600px; /* Hauteur fixe pour toutes les pompes */
}

.pompes-row > *:last-child {
  margin-right: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin: 5px;
}

.btn-primary {
  background-color: #e74c3c;
  color: white;
}

.btn-secondary {
  background-color: #7f8c8d;
  color: white;
}

</style> 