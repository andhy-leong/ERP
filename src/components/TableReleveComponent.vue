<template>
  <GridItem id="table-releve-container">
    <div class="chiffres">
      <div class="chiffres-item" v-for="(value, key) in chiffres" :key="key">
        <p class="chiffres-item-title">{{ key.toUpperCase() }} :</p>
        <p>{{ value }}</p>
      </div>
    </div>

    <table class="releve-table">
      <thead>
      <tr>
        <th>Type</th>
        <th>Détails transactions</th>
        <th>Total (en €)</th>
        <th>Heure</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(transaction, index) in transactions" :key="index">
        <td>{{ transaction.type }}</td>
        <td v-html="transaction.details"></td>
        <td>{{ transaction.total }} <span class="paiement">{{ transaction.paiement }}</span></td>
        <td>{{ transaction.heure }}</td>
      </tr>
      </tbody>
    </table>
  </GridItem>
</template>


<script lang="ts">
import GridItem from "@/components/GridItem.vue";

export default {
  name: "TableReleveComponent",
  components: { GridItem },
  data() {
    return {
      chiffres: {
        Transactions: "56",
        Caisse: "27 | 231 articles",
        Pompe: "29 passages",
        "Carburant Délivré": "765 L",
        "Montant Total": "128 976 €"
      },
      transactions: [
        { type: "Carburant", details: "⛽ E10 | pompe 3 | 34.82 L", total: "78.62", paiement: "CB", heure: "08:35" },
        { type: "Produits", details: "🛒 Matières premières | 4 articles", total: "31.98", paiement: "Espèces", heure: "08:03" },
        { type: "Charge", details: "⚡ Charge rapide | borne 3 | 32 kWh", total: "78.62", paiement: "CB", heure: "07:53" },
        { type: "Carburant", details: "⛽ E10 | pompe 3 | 34.82 L", total: "78.62", paiement: "CB", heure: "08:35" },
        { type: "Produits", details: "🛒 Matières premières | 4 articles", total: "31.98", paiement: "Espèces", heure: "08:03" },
        { type: "Charge", details: "⚡ Charge rapide | borne 3 | 32 kWh", total: "78.62", paiement: "CB", heure: "07:53" },
        { type: "Carburant", details: "⛽ E10 | pompe 3 | 34.82 L", total: "78.62", paiement: "CB", heure: "08:35" },
        { type: "Produits", details: "🛒 Matières premières | 4 articles", total: "31.98", paiement: "Espèces", heure: "08:03" },
        { type: "Charge", details: "⚡ Charge rapide | borne 3 | 32 kWh", total: "78.62", paiement: "CB", heure: "07:53" },
        { type: "Carburant", details: "⛽ E10 | pompe 3 | 34.82 L", total: "78.62", paiement: "CB", heure: "08:35" },
        { type: "Produits", details: "🛒 Matières premières | 4 articles", total: "31.98", paiement: "Espèces", heure: "08:03" },
        { type: "Charge", details: "⚡ Charge rapide | borne 3 | 32 kWh", total: "78.62", paiement: "CB", heure: "07:53" },
        { type: "Carburant", details: "⛽ E10 | pompe 3 | 34.82 L", total: "78.62", paiement: "CB", heure: "08:35" },
        { type: "Produits", details: "🛒 Matières premières | 4 articles", total: "31.98", paiement: "Espèces", heure: "08:03" },
        { type: "Charge", details: "⚡ Charge rapide | borne 3 | 32 kWh", total: "78.62", paiement: "CB", heure: "07:53" },
      ]
    };
  }
};
</script>


<style>
#table-releve-container {
  overflow-y: auto;
}

.chiffres {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  flex-wrap: wrap;
}
.chiffres-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.chiffres-item p.chiffres-item-title {
  font-size: smaller;
  color: grey;
}


.releve-table {
  width: calc(100% - 30px);
  border-collapse: collapse;
  margin: 10px 15px 15px 15px;
}
.releve-table th, .releve-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.releve-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}
.releve-table td {
  font-size: 0.9em;
  font-weight: normal;
}
.paiement {
  font-size: 0.75em;
  color: grey;
  margin-left: 5px;
}
</style>