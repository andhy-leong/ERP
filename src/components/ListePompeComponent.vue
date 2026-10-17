<template>
  <GridItem>
    <div class="liste-pompe-widget">
      <div class="widget-top" @click="$emit('aggrandir-pompe')">
        <div class="widget-title">
          <span class="p-icon">⛽</span>
          <h3>Pompes & Bornes</h3>
        </div>
        <span class="btn-expand-badge">Agrandir ⤢</span>
      </div>

      <div class="pompes-strip" @click="$emit('aggrandir-pompe')">
        <div 
          v-for="pompe in pompes" 
          :key="pompe.id" 
          class="pompe-mini-pill"
          :class="pompe.status"
        >
          <div class="pill-top">
            <span class="dot" :class="pompe.status"></span>
            <strong>P{{ pompe.numero }}</strong>
          </div>

          <div class="pill-status-text">
            <template v-if="pompe.status === 'in-use'">
              <span class="txt-use">En cours</span>
              <small>{{ pompe.details?.quantite || '0' }}L</small>
            </template>
            <template v-else-if="pompe.status === 'waiting-payment'">
              <span class="txt-pay">À payer</span>
              <small>{{ pompe.details?.montant || '0' }}€</small>
            </template>
            <template v-else-if="pompe.status === 'incident'">
              <span class="txt-incident">Incident</span>
            </template>
            <template v-else>
              <span class="txt-dispo">Dispo</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import GridItem from "@/components/GridItem.vue";
import { fetchPompes } from "@/services/erpService";
import { PompeData } from "@/data/mockDatabase";

defineEmits(['aggrandir-pompe']);

const pompes = ref<PompeData[]>([]);

onMounted(async () => {
  try {
    pompes.value = await fetchPompes();
  } catch (err) {
    console.error("Erreur chargement mini pompes", err);
  }
});
</script>

<style scoped>
.liste-pompe-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.widget-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.widget-title h3 {
  margin: 0;
  font-size: 14px;
  color: #1e293b;
  font-weight: 700;
}

.btn-expand-badge {
  font-size: 10px;
  color: #2563eb;
  background: #dbeafe;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.pompes-strip {
  display: flex;
  gap: 8px;
  padding: 10px;
  overflow-x: auto;
  align-items: center;
  flex: 1;
  cursor: pointer;
}

.pompe-mini-pill {
  flex: 1;
  min-width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: transform 0.15s ease;
}

.pompe-mini-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.pompe-mini-pill.active { border-color: #86efac; background: #f0fdf4; }
.pompe-mini-pill.in-use { border-color: #fde047; background: #fefce8; }
.pompe-mini-pill.waiting-payment { border-color: #93c5fd; background: #eff6ff; }
.pompe-mini-pill.incident { border-color: #fca5a5; background: #fef2f2; }

.pill-top {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.active { background: #22c55e; }
.dot.in-use { background: #eab308; }
.dot.waiting-payment { background: #3b82f6; }
.dot.incident { background: #ef4444; }

.pill-status-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  margin-top: 4px;
}

.txt-dispo { color: #166534; font-weight: 600; }
.txt-use { color: #854d0e; font-weight: 700; }
.txt-pay { color: #1e40af; font-weight: 700; }
.txt-incident { color: #991b1b; font-weight: 700; }
</style>