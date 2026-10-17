<template>
  <div class="header-widget-box" ref="widgetRef">
    <!-- WIDGET STATION STATUS -->
    <div v-if="type === 'StationStatus'" class="widget-station">
      <button @click="handleStationClick" class="btn-station-toggle" :class="{ open: isStationOpen }">
        <span class="status-indicator-dot"></span>
        <span>{{ isStationOpen ? 'Station Ouverte' : 'Station Fermée' }}</span>
        <span v-if="isGerant" class="hours-gear" title="Configurer les horaires">⚙️</span>
      </button>

      <!-- Popup Configuration des horaires pour le Gérant -->
      <div v-if="showHoursConfig && isGerant" class="hours-modal-overlay" @click.self="showHoursConfig = false">
        <div class="hours-card">
          <h4>🕒 Horaires d'Ouverture Station</h4>
          <div class="day-select-row">
            <label>Jour :</label>
            <select v-model="selectedDay" @change="loadHours">
              <option v-for="d in daysOfWeek" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div class="time-inputs-row">
            <div>
              <label>Ouverture :</label>
              <input type="time" v-model="openingHours" />
            </div>
            <div>
              <label>Fermeture :</label>
              <input type="time" v-model="closingHours" />
            </div>
          </div>
          <div class="hours-actions">
            <button class="btn-save-h" @click="saveHours">Enregistrer</button>
            <button class="btn-cancel-h" @click="showHoursConfig = false">Fermer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- AUTRES WIDGETS D'INFORMATIONS ERP (Calendrier, Tâches, Documents) -->
    <div v-else class="widget-info-pill" @click="toggleInfo">
      <div class="widget-icon-title">
        <span class="w-icon">{{ widgetIcon }}</span>
        <div class="w-text">
          <strong class="w-title">{{ widgetData.title }}</strong>
          <small class="w-subtitle">{{ widgetData.description }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  getStationStatus, 
  setStationStatus, 
  getStationHours, 
  updateStationHours 
} from '@/services/erpService';

const props = defineProps<{
  type: string;
}>();

const isStationOpen = ref(true);
const showHoursConfig = ref(false);
const isGerant = ref(false);
const selectedDay = ref('Lundi');
const openingHours = ref('06:00');
const closingHours = ref('22:00');
const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const loadHours = () => {
  const h = getStationHours(selectedDay.value);
  openingHours.value = h.ouverture;
  closingHours.value = h.fermeture;
};

onMounted(() => {
  isStationOpen.value = getStationStatus();
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    isGerant.value = user.isGerant === 1;
  }
  loadHours();
});

const handleStationClick = () => {
  if (isGerant.value) {
    showHoursConfig.value = !showHoursConfig.value;
  } else {
    isStationOpen.value = !isStationOpen.value;
    setStationStatus(isStationOpen.value);
  }
};

const saveHours = () => {
  updateStationHours(selectedDay.value, openingHours.value, closingHours.value);
  showHoursConfig.value = false;
  alert(`Horaires du ${selectedDay.value} mis à jour : ${openingHours.value} - ${closingHours.value}`);
};

const toggleInfo = () => {
  alert(`Info ERP [${props.type}] : ${widgetData.value.description}`);
};

const widgetIcon = computed(() => {
  switch (props.type) {
    case 'Calendar': return '📅';
    case 'Task': return '✅';
    case 'Documents': return '📁';
    default: return 'ℹ️';
  }
});

const widgetData = computed(() => {
  switch (props.type) {
    case 'Documents':
      return { title: 'Dernière Circulaire', description: 'Promotions Carburant & Boutique' };
    case 'Calendar':
      return { title: 'Briefing Équipe', description: 'Passation de service 14h00' };
    case 'Task':
      return { title: 'Tâche Urgente', description: 'Clôture de caisse & Relevé cuves' };
    default:
      return { title: props.type, description: 'Module ERP actif' };
  }
});
</script>

<style scoped>
.header-widget-box {
  position: relative;
  display: flex;
  align-items: center;
}

.btn-station-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-station-toggle.open {
  background: #f0fdf4;
  border-color: #86efac;
  color: #166534;
}

.status-indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ef4444;
}

.btn-station-toggle.open .status-indicator-dot {
  background: #22c55e;
  box-shadow: 0 0 8px #86efac;
}

.hours-gear {
  font-size: 12px;
  margin-left: 4px;
}

.widget-info-pill {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px 10px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.widget-info-pill:hover {
  background: #ffffff;
  border-color: #cbd5e1;
}

.widget-icon-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.w-icon {
  font-size: 16px;
}

.w-text {
  display: flex;
  flex-direction: column;
}

.w-title {
  font-size: 11px;
  color: #1e293b;
}

.w-subtitle {
  font-size: 9px;
  color: #64748b;
}

.hours-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.hours-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 360px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.hours-card h4 {
  margin: 0 0 14px 0;
  font-size: 15px;
}

.day-select-row, .time-inputs-row {
  margin-bottom: 12px;
  font-size: 12px;
}

.day-select-row select {
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  margin-top: 4px;
}

.time-inputs-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.time-inputs-row input {
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  margin-top: 4px;
  box-sizing: border-box;
}

.hours-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.btn-save-h {
  background: #25a249;
  color: white;
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 6px;
}

.btn-cancel-h {
  background: #e2e8f0;
  color: #334155;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
}
</style>