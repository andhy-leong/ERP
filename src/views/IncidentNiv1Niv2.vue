<template>
  <GridItem class="incidents-container">
    <div class="incidents-layout">
      <!-- Panneau de gauche : Liste des incidents -->
      <div class="incidents-list-panel">
        <div class="incidents-header">
          <h2>Incidents</h2>
          <div class="filter-icon" @click="toggleFilterMenu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            
            <!-- Menu déroulant de filtrage -->
            <div v-if="showFilterMenu" class="filter-menu">
              <div class="filter-option" @click="applyFilter('gravity-desc')">
                Gravité : Plus grave au moins grave
              </div>
              <div class="filter-option" @click="applyFilter('gravity-asc')">
                Gravité : Moins grave au plus grave
              </div>
              <div class="filter-option" @click="applyFilter('date-desc')">
                Date : Plus récent au plus ancien
              </div>
              <div class="filter-option" @click="applyFilter('date-asc')">
                Date : Plus ancien au plus récent
              </div>
            </div>
          </div>
        </div>
        
        <div class="incidents-list">
          <div v-if="loading" class="list-loading-indicator">
            Chargement des incidents...
          </div>
          
          <template v-else>
            <div 
              v-for="incident in sortedIncidents" 
              :key="incident.idIncident" 
              class="incident-item"
              :class="{
                'selected': selectedIncident && selectedIncident.idIncident === incident.idIncident,
                'resolved': incident.status
              }"
              @click="selectIncident(incident)"
            >
              <div 
                class="incident-marker" 
                :class="{
                  'niveau-1': incident.niveauIncident === 1,
                  'niveau-2': incident.niveauIncident === 2,
                  'niveau-3': incident.niveauIncident === 3
                }"
              ></div>
              <div class="incident-content">
                <div class="incident-title">{{ incident.intitule }}</div>
                <div class="incident-status" :class="{'resolved': incident.status}">
                  {{ incident.status ? 'Résolu' : 'Non résolu' }}
                </div>
              </div>
              <div class="incident-time">{{ formatTime(incident.heure) }}</div>
            </div>
            
            <div v-if="incidents.length === 0" class="no-incidents-message">
              Aucun incident signalé
            </div>
          </template>
        </div>

        <div class="button-container">
          <button 
            class="valider-button" 
            @click="saveIncident" 
            :disabled="!editMode"
            :class="{ 'active': editMode }"
          >
            Valider
          </button>
        </div>
      </div>

      <!-- Panneau de droite : Détails de l'incident -->
      <div v-if="selectedIncident" class="incident-details-panel">
        <div class="incident-details-header">
          <div class="header-row">
            <h2>{{ selectedIncident.intitule }}</h2>
            <span class="incident-timestamp">
              Signalé il y a {{ getTimeAgo(selectedIncident.date, selectedIncident.heure) }}
            </span>
          </div>
        </div>

        <!-- Table d'information -->
        <div class="incident-info-table">
          <div class="info-cell">
            <span class="info-label">ID</span>
            <span class="info-value">{{ selectedIncident.idIncident }}</span>
          </div>
          
          <div class="info-cell">
            <span class="info-label">Statut</span>
            <button 
              class="resolve-button" 
              @click="toggleIncidentStatus"
              :disabled="!canResolveIncident"
              :title="!canResolveIncident ? 'Vous n\'avez pas les droits nécessaires pour résoudre cet incident' : ''"
            >
              {{ selectedIncident.status ? 'Résolu' : 'Résoudre' }}
            </button>
          </div>
          
          <div class="info-cell">
            <span class="info-label">Le</span>
            <span class="info-value">{{ formatDateTime(selectedIncident.date, selectedIncident.heure) }}</span>
          </div>
        </div>
        
        <!-- Mode affichage -->
        <div v-if="!editMode">
          <div class="description-section">
            <h3>Description</h3>
            <p>{{ selectedIncident.detailTechnique }}</p>
          </div>
          
          <div class="remarks-section" v-if="selectedIncident.autreRemarque">
            <h3>Remarques supplémentaires</h3>
            <p>{{ selectedIncident.autreRemarque }}</p>
          </div>
          
          <div class="solution-section" v-if="selectedIncident.status && selectedIncident.solutionApportee">
            <h3>Solution apportée</h3>
            <p>{{ selectedIncident.solutionApportee }}</p>
          </div>
          
          <div class="advice-section" v-if="selectedIncident.status && selectedIncident.conseilAVenir">
            <h3>Conseil pour l'avenir</h3>
            <p>{{ selectedIncident.conseilAVenir }}</p>
          </div>
        </div>
        
        <!-- Mode édition -->
        <div v-else-if="editMode && editedIncident" class="edit-form">
          <div class="form-group">
            <label for="detailTechnique">Description</label>
            <textarea 
              id="detailTechnique" 
              v-model="editedIncident.detailTechnique" 
              rows="4"
              class="form-control"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="autreRemarque">Remarques supplémentaires</label>
            <textarea 
              id="autreRemarque" 
              v-model="editedIncident.autreRemarque" 
              rows="3"
              class="form-control"
            ></textarea>
          </div>
          
          <div class="form-group" v-if="editedIncident.status">
            <label for="solutionApportee">Solution apportée</label>
            <textarea 
              id="solutionApportee" 
              v-model="editedIncident.solutionApportee" 
              rows="3"
              class="form-control"
            ></textarea>
          </div>
          
          <div class="form-group" v-if="editedIncident.status">
            <label for="conseilAVenir">Conseil pour l'avenir</label>
            <textarea 
              id="conseilAVenir" 
              v-model="editedIncident.conseilAVenir" 
              rows="3"
              class="form-control"
            ></textarea>
          </div>
          
          <div class="edit-actions">
            <button @click="cancelEdit" class="cancel-button">Annuler</button>
          </div>
        </div>

        <div class="incident-actions" v-if="!editMode">
          <button @click="modifyIncident" class="modify-button">MODIFIER</button>
          <div class="nav-buttons">
            <button @click="navigateIncidents(-1)" class="nav-button">&lt;</button>
            <button @click="navigateIncidents(1)" class="nav-button">&gt;</button>
          </div>
        </div>
      </div>
      <div v-else class="incident-details-panel empty-state">
        <div class="select-incident-message">
          <p>Sélectionnez un incident pour visualiser les détails</p>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import GridItem from "@/components/GridItem.vue";
import { fetchIncidents, updateIncident, type Incident } from '@/services/IncidentService';

const incidents = ref<Incident[]>([]);
const selectedIncident = ref<Incident | null>(null);
const loading = ref(false);
const editMode = ref(false);
const editedIncident = ref<Incident | null>(null);
const showFilterMenu = ref(false);
const currentFilter = ref<'gravity-desc' | 'gravity-asc' | 'date-desc' | 'date-asc' | null>(null);
const isGerant = ref(false);

const sortedIncidents = computed(() => {
  if (!currentFilter.value) return incidents.value;

  return [...incidents.value].sort((a: Incident, b: Incident) => {
    switch (currentFilter.value) {
      case 'gravity-desc':
        return b.niveauIncident - a.niveauIncident;
      case 'gravity-asc':
        return a.niveauIncident - b.niveauIncident;
      case 'date-desc':
        return new Date(`${b.date}T${b.heure}`).getTime() - new Date(`${a.date}T${a.heure}`).getTime();
      case 'date-asc':
        return new Date(`${a.date}T${a.heure}`).getTime() - new Date(`${b.date}T${b.heure}`).getTime();
      default:
        return 0;
    }
  });
});

const selectIncident = (incident: Incident) => {
  if (editMode.value) {
    if (confirm('Des modifications sont en cours. Voulez-vous vraiment quitter sans sauvegarder ?')) {
      editMode.value = false;
      selectedIncident.value = incident;
    }
  } else {
    selectedIncident.value = incident;
  }
};

const formatDateTime = (date: string, time: string) => {
  const dateObj = new Date(`${date}T${time}`);
  return dateObj.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTimeAgo = (date: string, time: string) => {
  const now = new Date();
  const incidentDate = new Date(`${date}T${time}`);
  const diffInMinutes = Math.floor((now.getTime() - incidentDate.getTime()) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  const remainingHours = diffInHours % 24;
  const remainingMinutes = diffInMinutes % 60;

  if (diffInDays > 0) {
    return `${diffInDays}j ${remainingHours}h ${remainingMinutes}min`;
  } else if (diffInHours > 0) {
    return `${diffInHours}h ${remainingMinutes}min`;
  } else {
    return `${Math.abs(diffInMinutes)}min`;
  }
};

const modifyIncident = () => {
  editedIncident.value = JSON.parse(JSON.stringify(selectedIncident.value));
  editMode.value = true;
};

const cancelEdit = () => {
  editMode.value = false;
  editedIncident.value = null;
};

const saveIncident = async () => {
  if (!editedIncident.value) return;
  
  try {
    loading.value = true;
    const success = await updateIncident(editedIncident.value);
    
    if (success) {
      const index = incidents.value.findIndex(
        inc => inc.idIncident === editedIncident.value?.idIncident
      );
      
      if (index !== -1 && editedIncident.value) {
        incidents.value[index] = { ...editedIncident.value };
        selectedIncident.value = { ...editedIncident.value };
      }
      
      editMode.value = false;
      editedIncident.value = null;
      alert('Incident mis à jour avec succès !');
    } else {
      alert('Erreur lors de la mise à jour de l\'incident');
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Erreur lors de la mise à jour de l\'incident:', error);
    alert('Erreur lors de la mise à jour de l\'incident: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const toggleIncidentStatus = async () => {
  if (!selectedIncident.value) return;
  
  if (!canResolveIncident.value) {
    alert("Vous n'avez pas les droits nécessaires pour résoudre cet incident. Veuillez contacter un gérant.");
    return;
  }
  
  const newStatus = !selectedIncident.value.status;
  
  try {
    const response = await fetch('https://linserv-info-01/~rl303414/S401/updateIncidentStatus.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idIncident: selectedIncident.value.idIncident,
        status: newStatus ? 1 : 0
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Réponse du serveur:', data);
    
    selectedIncident.value.status = newStatus;
    
    if (newStatus && data.incident) {
      selectedIncident.value.dateSolution = data.incident.dateSolution;
      selectedIncident.value.heureSolution = data.incident.heureSolution;
    }
    
    const index = incidents.value.findIndex(inc => inc.idIncident === selectedIncident.value?.idIncident);
    if (index !== -1) {
      incidents.value[index].status = newStatus;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de l\'incident:', error);
    if (selectedIncident.value) {
      selectedIncident.value.status = !newStatus;
    }
  }
};

const navigateIncidents = (direction: number) => {
  if (!selectedIncident.value || editMode.value) return;
  
  const currentIndex = incidents.value.findIndex(
    inc => inc.idIncident === selectedIncident.value?.idIncident
  );
  const newIndex = currentIndex + direction;
  
  if (newIndex >= 0 && newIndex < incidents.value.length) {
    selectedIncident.value = incidents.value[newIndex];
  }
};

const loadIncidents = async () => {
  loading.value = true;
  try {
    incidents.value = await fetchIncidents();
    if (incidents.value.length > 0) {
      selectedIncident.value = incidents.value[0];
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const toggleFilterMenu = () => {
  showFilterMenu.value = !showFilterMenu.value;
};

const applyFilter = (filterType: 'gravity-desc' | 'gravity-asc' | 'date-desc' | 'date-asc') => {
  currentFilter.value = filterType;
  showFilterMenu.value = false;
};

const formatTime = (time: string) => {
  if (!time) return '';
  return time.split(':').slice(0, 2).join(':');
};

onMounted(() => {
  const userDataStr = localStorage.getItem('user');
  if (userDataStr) {
    const userData = JSON.parse(userDataStr);
    isGerant.value = userData.isGerant === 1;
  }
  loadIncidents();
});

const canResolveIncident = computed(() => {
  if (!selectedIncident.value) return false;
  
  if (isGerant.value) return true;
  
  return selectedIncident.value.niveauIncident < 3;
});
</script>

<style scoped>
.incidents-container {
  height: calc(100vh - 100px);
  display: flex;
  background-color: var(--base-200);
}

.incidents-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

/* Panneau de gauche : liste des incidents */
.incidents-list-panel {
  width: 45%;
  min-width: 300px;
  background-color: #f8f9fa;
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.incidents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.incidents-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.filter-icon {
  position: relative;
  cursor: pointer;
  padding: 5px;
}

.filter-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.filter-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 250px;
}

.filter-option {
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #343a40;
  font-size: 0.9rem;
}

.filter-option:hover {
  background-color: #f8f9fa;
}

.filter-option:not(:last-child) {
  border-bottom: 1px solid #dee2e6;
}

.incidents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.incident-item {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 15px 15px 15px 35px;
  background-color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.incident-item.selected {
  border-left: 3px solid #343a40;
  background-color: #f0f0f0;
}

.incident-item.resolved {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.incident-marker {
  position: absolute;
  left: 8px;
  top: 15px;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  transform: rotate(45deg);
}

.incident-marker.niveau-1 {
  background-color: var(--accent-yellow);
}

.incident-marker.niveau-2 {
  background-color: var(--accent-orange);
}

.incident-marker.niveau-3 {
  background-color: var(--accent-red);
}

.incident-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.incident-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.incident-status {
  font-size: 0.9rem;
  color: #6c757d;
  display: block;
  font-weight: bold;
}

.incident-status.resolved {
  color: #28a745;
}

.incident-time {
  color: #888;
  font-size: 0.8rem;
  text-align: right;
  margin-left: auto;
  padding-left: 10px;
}

/* Panneau de droite : détails de l'incident */
.incident-details-panel {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
  background-color: white;
}

.incident-details-header {
  margin-bottom: 20px;
}

.header-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 450px;
  margin-bottom: 20px;
}

.header-row h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #2D3648;
}

.incident-timestamp {
  font-size: 0.85rem;
  color: #6c757d;
  white-space: nowrap;
}

/* Table d'informations (Créé par, ID, Statut, Le) */
.incident-info-table {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.info-cell {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.info-value {
  font-weight: bold;
}

/* Style pour le bouton Résoudre */
.resolve-button {
  background-color: #343a40;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-block;
  font-weight: normal;
}

.resolve-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #6c757d;
}

/* Sections de description, remarques, etc. */
.description-section,
.remarks-section,
.solution-section,
.advice-section {
  margin-bottom: 25px;
}

.description-section h3,
.remarks-section h3,
.solution-section h3,
.advice-section h3 {
  margin-bottom: 10px;
  font-size: 1.1rem;
  font-weight: 600;
}

.description-section p,
.remarks-section p,
.solution-section p,
.advice-section p {
  line-height: 1.5;
  color: #333;
}

/* Formulaire d'édition */
.edit-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.95rem;
}

.edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.incident-actions {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
}

.modify-button {
  background-color: #343a40;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
}

.nav-buttons {
  display: flex;
  gap: 10px;
}

.nav-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #343a40;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.no-incidents-message {
  text-align: center;
  padding: 30px 0;
  color: #666;
  font-style: italic;
  font-size: 1.1rem;
  margin: 20px auto;
  background-color: #f5f5f5;
  border-radius: 6px;
  border: 1px dashed #ccc;
  width: 90%;
}

.list-loading-indicator {
  text-align: center;
  padding: 20px 0;
  color: #343a40;
  font-style: italic;
}

/* Message affiché lorsqu'aucun incident n'est sélectionné */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
}

.select-incident-message {
  text-align: center;
  color: #666;
  font-style: italic;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 0 10px;
}

.valider-button {
  background-color: #343a40;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
}

.valider-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.valider-button.active {
  background-color: #343a40;
}
</style>
  