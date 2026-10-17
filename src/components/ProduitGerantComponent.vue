<template>
  <GridItem id="produits-container">
    <div class="produits-card">
      <div class="produits-header">
        <div class="p-title">
          <span class="icon">📦</span>
          <h3>Catalogue Produits ERP</h3>
        </div>
        <button class="btn-ajouter-prod" @click="showAddModal = true">+ Nouveau Produit</button>
      </div>

      <div class="search-bar-row">
        <input 
          type="search" 
          v-model="searchQuery" 
          placeholder="Filtrer par nom, code ou catégorie..."
          class="produits-search"
        />
        <span class="count-badge">{{ filteredItems.length }} réf.</span>
      </div>

      <div id="produits-list-container">
        <p v-if="loading" class="status-msg">Chargement du catalogue...</p>
        <p v-else-if="filteredItems.length === 0" class="status-msg">Aucun produit ne correspond à la recherche.</p>
        <div v-else class="table-container">
          <table class="produits-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Désignation</th>
                <th>Catégorie</th>
                <th>P. Achat</th>
                <th>P. Vente</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredItems" :key="item.idProduit">
                <td class="col-code">#{{ item.codeProduit }}</td>
                <td class="col-nom"><strong>{{ item.nomProduit }}</strong></td>
                <td><span class="badge-cat">{{ item.categorie }}</span></td>
                <td>{{ item.prixAchat.toFixed(2) }}€</td>
                <td><strong class="col-prix">{{ item.prix.toFixed(2) }}€</strong></td>
                <td>
                  <span class="badge-stock" :class="{ alert: item.qteEnStock <= item.seuilCritique }">
                    {{ item.qteEnStock }} {{ item.unite }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Ajouter Produit -->
      <div v-if="showAddModal" class="modal-backdrop">
        <div class="modal-form-box">
          <h3>Ajouter une référence au catalogue</h3>
          <form @submit.prevent="handleCreateProduct">
            <div class="form-row">
              <label>Nom du produit :</label>
              <input v-model="newProd.nomProduit" required placeholder="ex: Essuie-glace universel 55cm" />
            </div>
            <div class="form-grid-2">
              <div>
                <label>Code Article :</label>
                <input type="number" v-model.number="newProd.codeProduit" required placeholder="ex: 5012" />
              </div>
              <div>
                <label>Catégorie :</label>
                <select v-model="newProd.categorie" required>
                  <option value="Carburants">Carburants</option>
                  <option value="Entretien Auto">Entretien Auto</option>
                  <option value="Alimentation">Alimentation</option>
                  <option value="Boutique">Boutique</option>
                  <option value="Accessoires">Accessoires</option>
                  <option value="Services">Services</option>
                </select>
              </div>
            </div>
            <div class="form-grid-3">
              <div>
                <label>Prix Vente (€) :</label>
                <input type="number" step="0.01" v-model.number="newProd.prix" required />
              </div>
              <div>
                <label>Prix Achat (€) :</label>
                <input type="number" step="0.01" v-model.number="newProd.prixAchat" required />
              </div>
              <div>
                <label>Stock Initial :</label>
                <input type="number" v-model.number="newProd.qteEnStock" required />
              </div>
            </div>
            <div class="modal-buttons-row">
              <button type="button" class="btn-cancel" @click="showAddModal = false">Annuler</button>
              <button type="submit" class="btn-confirm">Enregistrer dans l'ERP</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import GridItem from "@/components/GridItem.vue";
import { fetchProduits, addProduit } from "@/services/erpService";
import { ProduitData } from "@/data/mockDatabase";

const items = ref<ProduitData[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const showAddModal = ref(false);

const newProd = ref({
  nomProduit: '',
  codeProduit: 5001,
  categorie: 'Boutique',
  prix: 3.50,
  prixAchat: 1.50,
  qteEnStock: 20,
  seuilCritique: 5,
  unite: 'unite' as const,
  description: 'Article boutique station service'
});

const loadCatalog = async () => {
  loading.value = true;
  try {
    items.value = await fetchProduits();
  } catch (err) {
    console.error("Erreur chargement catalogue", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCatalog();
});

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return items.value;
  const q = searchQuery.value.toLowerCase().trim();
  return items.value.filter(p => 
    p.nomProduit.toLowerCase().includes(q) ||
    p.codeProduit.toString().includes(q) ||
    p.categorie.toLowerCase().includes(q)
  );
});

const handleCreateProduct = async () => {
  try {
    await addProduit({ ...newProd.value });
    showAddModal.value = false;
    await loadCatalog();
  } catch (e) {
    console.error("Erreur ajout produit", e);
  }
};
</script>

<style scoped>
.produits-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.produits-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.p-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.p-title h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.btn-ajouter-prod {
  background: #25a249;
  color: white;
  padding: 4px 10px;
  font-size: 11px;
  border-radius: 6px;
}

.search-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.produits-search {
  flex: 1;
  padding: 6px 10px;
  font-size: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.count-badge {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

#produits-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 6px 12px;
}

.table-container {
  overflow-x: auto;
}

.produits-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.produits-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid #cbd5e1;
}

.produits-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

.col-code {
  color: #64748b;
  font-family: monospace;
}

.col-nom {
  color: #0f172a;
}

.col-prix {
  color: #16a34a;
}

.badge-cat {
  font-size: 10px;
  padding: 2px 6px;
  background: #f1f5f9;
  border-radius: 4px;
  color: #475569;
}

.badge-stock {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  background: #dcfce7;
  color: #166534;
  border-radius: 4px;
}

.badge-stock.alert {
  background: #fee2e2;
  color: #b91c1c;
}

.status-msg {
  text-align: center;
  color: #64748b;
  font-size: 12px;
  padding: 20px;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-form-box {
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-form-box h3 {
  margin: 0 0 12px 0;
  font-size: 15px;
}

.form-row, .form-grid-2, .form-grid-3 {
  margin-bottom: 10px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.modal-form-box label {
  font-size: 11px;
  color: #475569;
  margin-bottom: 4px;
  display: block;
}

.modal-form-box input, .modal-form-box select {
  width: 100%;
  padding: 6px 8px;
  font-size: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  box-sizing: border-box;
}

.modal-buttons-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.btn-cancel {
  background: #e2e8f0;
  color: #334155;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
}

.btn-confirm {
  background: #2563eb;
  color: white;
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 6px;
}
</style>