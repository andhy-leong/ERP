<script lang="ts">
import {defineComponent, nextTick, onMounted, ref} from 'vue';
import BasePopUp from "@/components/header-widget/BasePopUp.vue";


export default defineComponent({
  components: {BasePopUp},
  props: {
    type: { // types can be Calendar, Task, Documents, StationStatus
      type: String,
      required: true
    }
  },
  setup(props) {
    const widgetType = ref(props.type);
    const widget = ref(getWidget(props.type));
    const widgetRef = ref<HTMLElement | null>(null);
    const popupRef = ref<InstanceType<typeof BasePopUp> | null>(null);
    const popupPosition = ref({ top: "0px", left: "0px" });
    const popupVisible = ref("block");
    const isStationOpen = ref(false);
    const showHoursConfig = ref(false);
    const selectedDay = ref('Lundi');
    const openingHours = ref("06:00");
    const closingHours = ref("20:00");
    const isGerant = ref(false);
    const daysOfWeek = ref(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']);

    // Fonction pour calculer la position du popup
    const updatePopupPosition = () => {
      if (widgetRef.value && popupRef.value) {
        const widgetRect = widgetRef.value.getBoundingClientRect();
        // const popupRect = popupRef.value.$el.getBoundingClientRect();

        popupPosition.value = {
          top: `${widgetRect.bottom + window.scrollY}px`, // En dessous du widget
          left: `${widgetRect.left}px` // Aligné à droite
        };
        if (popupVisible.value === "none") {
          popupVisible.value = "block";
        } else {
          popupVisible.value = "none";
        }
      }
    };

    const toggleStoreStatus = async () => {
      isStationOpen.value = !isStationOpen.value;
      
      try {
        const response = await fetch('https://linserv-info-01.campus.unice.fr/~rl303414/S401/updatePompesStatus.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            etat: isStationOpen.value ? 1 : 0
          }),
        });
        const data = await response.json();
        console.log('Réponse du serveur:', data);
      } catch (error) {
        console.error('Erreur lors de la mise à jour des pompes:', error);
      }
    };

    // Vérifier si l'utilisateur est gérant
    onMounted(() => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        isGerant.value = user.isGerant === 1;
      }
      nextTick(updatePopupPosition);
      window.addEventListener("resize", updatePopupPosition);
      window.addEventListener("scroll", updatePopupPosition);
    });

    const handleStationClick = async () => {
      if (isGerant.value) {
        showHoursConfig.value = !showHoursConfig.value;
      } else {
        await toggleStoreStatus();
      }
    };

    const updateHours = async () => {
      try {
        const response = await fetch('https://linserv-info-01.campus.unice.fr/~rl303414/S401/updateStationHours.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jourSemaine: selectedDay.value,
            heureOuverture: openingHours.value + ':00',
            heureFermeture: closingHours.value + ':00'
          }),
        });
        const data = await response.json();
        console.log('Horaires mis à jour:', data);
        showHoursConfig.value = false;
      } catch (error) {
        console.error('Erreur lors de la mise à jour des horaires:', error);
      }
    };

    const loadHours = async () => {
      try {
        const response = await fetch(`https://linserv-info-01.campus.unice.fr/~rl303414/S401/getStationHours.php?jour=${selectedDay.value}`);
        const data = await response.json();
        if (data.success) {
          openingHours.value = data.heureOuverture.slice(0, 5);
          closingHours.value = data.heureFermeture.slice(0, 5);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des horaires:', error);
      }
    };

    return {
      widgetType,
      widget,
      widgetRef,
      popupRef,
      popupPosition,
      popupVisible,
      updatePopupPosition,
      isStationOpen,
      toggleStoreStatus,
      showHoursConfig,
      selectedDay,
      daysOfWeek,
      openingHours,
      closingHours,
      isGerant,
      handleStationClick,
      updateHours,
      loadHours
    };
  }

});

const getWidget = (widgetType: string) => {

  let title = '';
  let location = '';
  let description = '';

  switch (widgetType) {
    case 'Documents':
      title = '32/03/25';
      location = 'PDF';
      description = "Promotions d'hiver";
      break;
    case 'Calendar':
      title = '11:00';
      location = 'Salle de réunion';
      description = "Réunion quotidienne";
      break;
    case 'Task':
      title = '31/03/25';
      location = 'urgent';
      description = "Faire la compta";
      break;
    case 'StationStatus':
      title = 'Station';
      location = 'Status';
      description = '';
      break;
    default:
      title = 'Unknown Widget';
      location = 'Unknown Location';
  }

  // Return the widget title and location
  return { title: title, location: location, description: description };
}

</script>

<template>

  <div ref="widgetRef" class="header-widget" @click="updatePopupPosition">

    <div class="header-widget__header">
      <h2 class="header-widget__title">{{ widget.title }}</h2>
      <h3 class="header-widget__location">{{ widget.location }}</h3>
    </div>
    <div class="header-widget__content">
      <p v-if="widgetType !== 'StationStatus'" class="header-widget__description">{{ widget.description }}</p>
      <div v-else class="station-status-container">
        <button @click="handleStationClick" class="station-status-button">
          <span :class="{'circle-open': isStationOpen, 'circle-closed': !isStationOpen}"></span>
          {{ isStationOpen ? 'Magasin ouvert' : 'Magasin fermé' }}
        </button>
        
        <!-- Popup de configuration des horaires -->
        <div v-if="showHoursConfig && isGerant" class="hours-config-popup">
          <div class="hours-config-content">
            <h3>Configuration des horaires</h3>
            <div class="day-selector">
              <label>Jour :</label>
              <select v-model="selectedDay" @change="loadHours">
                <option v-for="day in daysOfWeek" :key="day" :value="day">{{ day }}</option>
              </select>
            </div>
            <div class="hours-inputs">
              <div class="hours-input-group">
                <label>Ouverture :</label>
                <input type="time" v-model="openingHours" />
              </div>
              <div class="hours-input-group">
                <label>Fermeture :</label>
                <input type="time" v-model="closingHours" />
              </div>
            </div>
            <div class="hours-actions">
              <button @click="updateHours" class="save-hours">Enregistrer</button>
              <button @click="showHoursConfig = false" class="cancel-hours">Annuler</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <BasePopUp
      v-if="popupVisible"
      ref="popupRef"
      :title="widgetType"
      :style="{ top: popupPosition.top, left: popupPosition.left, display: popupVisible }" />

</template>

<style scoped>
.header-widget {
  display: flex;
  border: var(--base-900) 1px solid;
  background-color: var(--base-200);
  gap: 0;
  flex-direction: column;
  border-radius: 10px;
  padding: 5px 10px;
}

.header-widget * {
  font-size: 12px;
  margin: 0;
}

.header-widget > div {
  height: 20px;
}

.header-widget__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.header-widget__content {
  display: flex;
  align-items: start;
  flex-direction: row;
}

h3 {
  margin: 0;
  font-weight: normal;
  border-left: var(--base-900) 1px solid;
  padding-left: 5px;
}

.station-status-button {
  background-color: white;
  color: black;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 12px;
}

.circle-open, .circle-closed {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.circle-open {
  background-color: green;
}

.circle-closed {
  background-color: red;
}

.station-status-container {
  position: relative;
}

.hours-config-popup {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid var(--base-900);
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.hours-config-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hours-config-content h3 {
  margin: 0;
  font-size: 14px;
  color: var(--base-900);
}

.hours-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hours-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hours-input-group label {
  font-size: 12px;
  min-width: 80px;
}

.hours-input-group input {
  padding: 4px 8px;
  border: 1px solid var(--base-400);
  border-radius: 4px;
  font-size: 12px;
}

.hours-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.save-hours, .cancel-hours {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.save-hours {
  background-color: var(--accent-green);
  color: white;
  border: none;
}

.cancel-hours {
  background-color: var(--base-200);
  border: 1px solid var(--base-400);
}

.day-selector {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.day-selector select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
</style>