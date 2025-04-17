<template>
  <GridItem>
    <div class="incidents-list" @click="$emit('ouvrir-incidents')">
      <h2>Incidents</h2>
      <div v-if="loading" class="loading">
        Chargement des incidents...
      </div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      <div v-else class="incidents">
        <div v-for="incident in incidents" :key="incident.idIncident" class="incident-item">
          <div class="incident-header">
            <div :class="['severity-indicator', getSeverityClass(incident.niveauIncident)]"></div>
            <span class="incident-title">{{ incident.intitule }}</span>
          </div>
          <div class="incident-status" :class="{ resolved: incident.status }">
            {{ incident.status ? 'Résolu' : 'Non résolu' }}
          </div>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue';
import GridItem from "@/components/GridItem.vue";
import { fetchIncidents, type Incident } from '@/services/IncidentService';

const incidents = ref<Incident[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const getSeverityClass = (level: number) => {
  switch (level) {
    case 1: return 'severity-low';
    case 2: return 'severity-medium';
    case 3: return 'severity-high';
    default: return 'severity-low';
  }
};

onMounted(async () => {
  try {
    incidents.value = await fetchIncidents();
  } catch (err) {
    error.value = "Erreur lors du chargement des incidents";
    console.error(err);
  } finally {
    loading.value = false;
  }
});

defineEmits(['ouvrir-incidents']);
</script>

<style scoped>
.incidents-list {
  padding: 8px;
  height: 100%;
  overflow: hidden;
  position: relative;
}

h2 {
  margin-bottom: 15px;
  font-size: 1.2em;
  position: relative;
  padding-left: 4px;
}

h2:before {
  content: "▲";
  position: relative;
  margin-right: 5px;
  font-size: 0.8rem;
  top: -2px;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #dc3545;
}

.incidents {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  height: calc(100% - 40px);
  padding-right: 8px;
  margin-right: -8px;
  max-height: 250px;
}

.incident-item {
  background: white;
  border: 1px solid var(--base-400);
  border-radius: 4px;
  padding: 6px;
  min-width: 0;
}

.incident-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  min-width: 0;
}

.severity-indicator {
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
  flex-shrink: 0;
}

.severity-low {
  background-color: var(--accent-yellow);
}

.severity-medium {
  background-color: var(--accent-orange);
}

.severity-high {
  background-color: var(--accent-red);
}

.incident-title {
  font-weight: 500;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.incident-status {
  font-size: 0.75em;
  color: #dc3545;
  margin-top: 4px;
  white-space: nowrap;
  font-weight: bold;
}

.incident-status.resolved {
  color: #28a745;
}

/* Personnalisation de la barre de défilement */
.incidents::-webkit-scrollbar {
  width: 8px;
}

.incidents::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 4px;
}

.incidents::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 4px;
}
</style>