<template>
  <GridItem id="table-releve-container">
    <div class="releve-card">
      <div class="releve-header">
        <div class="r-title">
          <span class="icon">📑</span>
          <h3>Journal des Opérations & Ventes</h3>
        </div>
        <div class="quick-stats">
          <span class="q-stat">Total: <strong>{{ totalCA.toFixed(2) }}€</strong></span>
          <span class="q-stat">Ventes: <strong>{{ transactions.length }}</strong></span>
        </div>
      </div>

      <div class="table-scroll-wrapper">
        <table class="releve-table">
          <thead>
            <tr>
              <th>Heure</th>
              <th>Type</th>
              <th>Détails articles</th>
              <th>Client</th>
              <th>Paiement</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="transactions.length === 0">
              <td colspan="6" class="text-center">Aucune transaction enregistrée</td>
            </tr>
            <tr v-for="tx in transactions" :key="tx.idTransaction">
              <td class="col-time">{{ tx.heureTransaction ? tx.heureTransaction.slice(0, 5) : '08:00' }}</td>
              <td>
                <span class="badge-type" :class="{ fuel: isFuel(tx) }">
                  {{ isFuel(tx) ? '⛽ Carburant' : '🛒 Boutique' }}
                </span>
              </td>
              <td class="col-details">
                <span v-for="(p, i) in tx.produits" :key="i" class="prod-badge">
                  {{ p.nomProduit }} (x{{ p.qteAchete }})
                </span>
              </td>
              <td>{{ tx.clientNom || (tx.idClient ? `Client #${tx.idClient}` : 'Comptoir') }}</td>
              <td>
                <span class="badge-pay">
                  {{ tx.paiements && tx.paiements[0] ? tx.paiements[0].mode : 'CB' }}
                </span>
              </td>
              <td class="col-total">
                <strong>{{ tx.prixTotal.toFixed(2) }} €</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import GridItem from "@/components/GridItem.vue";
import { fetchTransactions } from "@/services/erpService";
import { TransactionCaisseData } from "@/data/mockDatabase";

const transactions = ref<TransactionCaisseData[]>([]);

onMounted(async () => {
  try {
    transactions.value = await fetchTransactions();
  } catch (e) {
    console.error("Erreur relevé transactions", e);
  }
});

const totalCA = computed(() => {
  return transactions.value.reduce((sum, tx) => sum + tx.prixTotal, 0);
});

const isFuel = (tx: TransactionCaisseData) => {
  return tx.produits?.some(p => 
    p.nomProduit.toLowerCase().includes('sp') || 
    p.nomProduit.toLowerCase().includes('gazole') || 
    p.nomProduit.toLowerCase().includes('éthanol') || 
    p.nomProduit.toLowerCase().includes('carburant') ||
    p.nomProduit.toLowerCase().includes('charge')
  );
};
</script>

<style scoped>
.releve-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.releve-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.r-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.r-title h3 {
  margin: 0;
  font-size: 13px;
  color: #1e293b;
  font-weight: 700;
}

.quick-stats {
  display: flex;
  gap: 8px;
}

.q-stat {
  font-size: 11px;
  color: #475569;
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.q-stat strong {
  color: #0f172a;
}

.table-scroll-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 6px 10px;
}

.releve-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.releve-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid #cbd5e1;
}

.releve-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

.col-time {
  font-family: monospace;
  color: #64748b;
}

.col-details {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.prod-badge {
  font-size: 10px;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #334155;
}

.badge-type {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f0fdf4;
  color: #166534;
  font-weight: 600;
}

.badge-type.fuel {
  background: #eff6ff;
  color: #1e40af;
}

.badge-pay {
  font-size: 10px;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 1px 4px;
  border-radius: 4px;
}

.col-total {
  text-align: right;
  color: #0f172a;
}

.text-center {
  text-align: center;
  padding: 16px;
  color: #94a3b8;
}
</style>