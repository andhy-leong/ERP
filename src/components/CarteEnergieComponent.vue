<template>
  <GridItem>
    <div class="carte-energie">
      <div class="button-container">
        <button>Créer</button>
        <button class="not-selected">Pertes</button>
      </div>
      <div class="formulaire">
        <div class="ligne">
          <div class="champ">
            <label>Nom</label>
            <input type="text" required/>
          </div>
          <div class="champ">
            <label>Prénom</label>
            <input type="text" required/>
          </div>
        </div>

        <div class="ligne">
          <div class="champ">
            <label>Code Postal</label>
            <input type="number" min="1001" max="99138" />
          </div>
          <div class="champ">
            <label>Ville</label>
            <input type="text" />
          </div>
          <div class="champ">
            <label>Pays</label>
            <input type="text" />
          </div>
        </div>

        <div class="ligne">
          <div class="champ">
            <label>Adresse postale</label>
            <input type="text" />
          </div>
        </div>

        <div class="ligne">
          <div class="champ">
            <label>Complément d'adresse</label>
            <input type="text" />
          </div>
        </div>

        <div class="ligne">
          <div class="champ">
            <label>Mail</label>
            <input type="email" />
          </div>
          <div class="champ">
            <label>Téléphone</label>
            <input type="number" />
          </div>
        </div>

        <div class="ligne bouton-container">
          <button>Valider</button>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script>
import GridItem from "@/components/GridItem.vue";

export default {
  components: { GridItem }
};
</script>

<style>
.carte-energie {
  display: flex;
  flex-direction: column;
  padding: 15px;
  max-width: 100%;
  box-sizing: border-box;
  height: 100%;
  justify-content: center;
}

.carte-energie .button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.carte-energie .button-container button {
  font-size: 20px;
  padding: 7px 20px;
  border-radius: 0;
}

.carte-energie .button-container button.not-selected {
  background: var(--base-200);
  border: 2px solid var(--base-900);
  color: var(--base-900);
}

.carte-energie .formulaire {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-height: calc(100% - 50px);
  justify-content: center;
}

.carte-energie .ligne {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
  width: 100%;
}

.carte-energie .champ {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
  box-sizing: border-box;
}

.carte-energie .champ:last-child {
  margin-right: 0;
}

.carte-energie .ligne.bouton-container {
  display: flex;
  justify-content: center;
}


.carte-energie .ligne .champ:last-child {
  margin-right: 0;
}
</style>