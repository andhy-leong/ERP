<template>
  <GridItem>
    <div class="carte-energie-card">
      <div class="tab-header">
        <button 
          :class="{ active: activeTab === 'creer' }" 
          @click="activeTab = 'creer'"
        >
          💳 Nouvelle Carte Énergie
        </button>
        <button 
          :class="{ active: activeTab === 'pertes' }" 
          @click="activeTab = 'pertes'"
        >
          🔍 Solde & Opposition
        </button>
      </div>

      <!-- Onglet Création de carte -->
      <div v-if="activeTab === 'creer'" class="tab-body">
        <div v-if="successMsg" class="success-alert">
          {{ successMsg }}
        </div>

        <form @submit.prevent="handleCreateCarte" class="carte-form">
          <div class="form-cols-2">
            <div class="champ">
              <label>Nom *</label>
              <input type="text" v-model="form.nom" required placeholder="ex: Dupont" />
            </div>
            <div class="champ">
              <label>Prénom *</label>
              <input type="text" v-model="form.prenom" required placeholder="ex: Jean" />
            </div>
          </div>

          <div class="form-cols-3">
            <div class="champ">
              <label>Code Postal *</label>
              <input type="text" v-model="form.cp" required placeholder="06000" />
            </div>
            <div class="champ">
              <label>Ville *</label>
              <input type="text" v-model="form.ville" required placeholder="Nice" />
            </div>
            <div class="champ">
              <label>Pays</label>
              <input type="text" v-model="form.pays" placeholder="France" />
            </div>
          </div>

          <div class="champ">
            <label>Adresse postale</label>
            <input type="text" v-model="form.adresse" placeholder="Numéro et nom de rue" />
          </div>

          <div class="form-cols-2">
            <div class="champ">
              <label>Email *</label>
              <input type="email" v-model="form.email" required placeholder="client@domaine.fr" />
            </div>
            <div class="champ">
              <label>Téléphone *</label>
              <input type="tel" v-model="form.telephone" required placeholder="06 00 00 00 00" />
            </div>
          </div>

          <div class="form-cols-2">
            <div class="champ">
              <label>Crédit Initial (€)</label>
              <input type="number" step="5" min="0" v-model.number="form.soldeInitial" />
            </div>
            <div class="champ align-end">
              <button type="submit" class="btn-valider-carte" :disabled="loading">
                {{ loading ? 'Création...' : 'Créer & Activer la Carte' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Onglet Recherche & Opposition -->
      <div v-else class="tab-body">
        <div class="search-client-card">
          <input 
            type="search" 
            v-model="searchQuery" 
            placeholder="Rechercher client par nom ou n° carte..."
            class="input-search-client"
          />
          <div class="client-results-scroll" v-if="clientsList.length > 0">
            <div 
              v-for="c in clientsList" 
              :key="c.idClient" 
              class="client-card-item"
            >
              <div class="cc-info">
                <strong>{{ c.nomClient }} {{ c.prenomClient }}</strong>
                <span class="cc-num">N° {{ c.numeroCarteEnergie }}</span>
                <span class="cc-solde">Solde: {{ (c.soldeCarteEnergie || 0).toFixed(2) }}€</span>
              </div>
              <button class="btn-oppose" @click="declarerPerte(c)">Déclarer Perte</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import GridItem from "@/components/GridItem.vue";
import { saveClient, fetchClients } from "@/services/erpService";
import { ClientData } from "@/data/mockDatabase";

const activeTab = ref<'creer' | 'pertes'>('creer');
const loading = ref(false);
const successMsg = ref('');
const searchQuery = ref('');
const clientsList = ref<ClientData[]>([]);

const form = ref({
  nom: '',
  prenom: '',
  cp: '06000',
  ville: 'Nice',
  pays: 'France',
  adresse: '',
  email: '',
  telephone: '',
  soldeInitial: 50
});

const loadClients = async () => {
  try {
    clientsList.value = await fetchClients(searchQuery.value);
  } catch (e) {
    console.error("Erreur chargement clients", e);
  }
};

watch(searchQuery, () => {
  loadClients();
});

onMounted(() => {
  loadClients();
});

const handleCreateCarte = async () => {
  loading.value = true;
  successMsg.value = '';
  try {
    const newClient = await saveClient({
      nomClient: form.value.nom,
      prenomClient: form.value.prenom,
      codePostal: form.value.cp,
      ville: form.value.ville,
      pays: form.value.pays,
      adresse: form.value.adresse,
      emailClient: form.value.email,
      telephoneClient: form.value.telephone,
      soldeCarteEnergie: form.value.soldeInitial,
      numeroCarteEnergie: ''
    });

    successMsg.value = `Carte créée avec succès ! N° ${newClient.numeroCarteEnergie} (Solde: ${newClient.soldeCarteEnergie}€)`;
    form.value.nom = '';
    form.value.prenom = '';
    form.value.email = '';
    form.value.telephone = '';
    await loadClients();
  } catch (err) {
    console.error("Erreur création carte", err);
  } finally {
    loading.value = false;
  }
};

const declarerPerte = (client: ClientData) => {
  if (confirm(`Confirmez-vous la mise en opposition de la carte ${client.numeroCarteEnergie} pour ${client.nomClient} ?`)) {
    alert(`Carte ${client.numeroCarteEnergie} mise en opposition. Le solde de ${client.soldeCarteEnergie}€ est sécurisé.`);
  }
};
</script>

<style scoped>
.carte-energie-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.tab-header {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.tab-header button {
  flex: 1;
  padding: 8px 12px;
  font-size: 12px;
  background: transparent;
  color: #64748b;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  cursor: pointer;
  font-weight: 600;
}

.tab-header button.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  background: #ffffff;
}

.tab-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 14px;
}

.success-alert {
  background: #dcfce7;
  color: #166534;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 10px;
}

.carte-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-cols-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.form-cols-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.champ {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.champ label {
  font-size: 10px;
  color: #475569;
  font-weight: 600;
}

.champ input {
  padding: 5px 8px;
  font-size: 11px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #ffffff;
}

.align-end {
  justify-content: flex-end;
}

.btn-valider-carte {
  background: #25a249;
  color: white;
  padding: 6px 14px;
  font-size: 11px;
  border-radius: 6px;
  font-weight: 700;
}

.input-search-client {
  width: 100%;
  padding: 6px 10px;
  font-size: 11px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  margin-bottom: 8px;
}

.client-results-scroll {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}

.client-card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.cc-info {
  display: flex;
  flex-direction: column;
}

.cc-info strong {
  font-size: 11px;
  color: #0f172a;
}

.cc-num {
  font-size: 10px;
  color: #64748b;
  font-family: monospace;
}

.cc-solde {
  font-size: 10px;
  font-weight: 700;
  color: #16a34a;
}

.btn-oppose {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  padding: 4px 8px;
  font-size: 10px;
  border-radius: 4px;
}
</style>