<template>
  <GridItem>
    <div class="liste-pompes-container">
      <div class="pompes-header-bar">
        <div class="header-left">
          <button class="btn-retour-dashboard" @click="$emit('retour')">← Vue générale ERP</button>
          <h2>Supervision Détaillée des 6 Pompes</h2>
        </div>
        <div class="header-right-badges">
          <span class="badge-status-counter active">{{ countActive }} en service</span>
          <span class="badge-status-counter warning">{{ countWaiting }} à régler</span>
          <span class="badge-status-counter danger">{{ countIncident }} anomalie</span>
        </div>
      </div>

      <div class="pompes-scroll-container">
        <div class="pompes-grid">
          <PompeComponent 
            v-for="pompe in pompes" 
            :key="pompe.id" 
            :pompeId="pompe.id"
            :carburantsList="pompe.carburants"
          />
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PompeComponent from './PompeComponent.vue';
import GridItem from "@/components/GridItem.vue";
import { fetchPompes } from '@/services/erpService';
import { PompeData } from '@/data/mockDatabase';

defineEmits(['retour']);

const pompes = ref<PompeData[]>([]);

const chargerPompes = async () => {
  try {
    pompes.value = await fetchPompes();
  } catch (err) {
    console.error("Erreur chargement pompes", err);
  }
};

onMounted(() => {
  chargerPompes();
});

const countActive = computed(() => pompes.value.filter(p => p.status === 'active' || p.status === 'in-use').length);
const countWaiting = computed(() => pompes.value.filter(p => p.status === 'waiting-payment').length);
const countIncident = computed(() => pompes.value.filter(p => p.status === 'incident').length);
</script>

<style scoped>
.liste-pompes-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  background: #f1f5f9;
  box-sizing: border-box;
  overflow: hidden;
}

.pompes-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  background: white;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 16px;
  color: #0f172a;
}

.btn-retour-dashboard {
  background: #1e293b;
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
}

.header-right-badges {
  display: flex;
  gap: 8px;
}

.badge-status-counter {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
}

.badge-status-counter.active { background: #dcfce7; color: #166534; }
.badge-status-counter.warning { background: #fef3c7; color: #92400e; }
.badge-status-counter.danger { background: #fee2e2; color: #991b1b; }

.pompes-scroll-container {
  flex: 1;
  overflow-y: auto;
}

.pompes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  height: 100%;
}
</style>