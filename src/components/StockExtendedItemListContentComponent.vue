<template>
  <div class="list-item" @click="handleClick">
    <span class="stock-indicator" :class="stockColor"></span>
    {{ item.nomProduit }} Stock: {{ item.qteEnStock}}{{ item.unite !== 'unite' ? ' ' + item.unite : '' }}
  </div>
</template>

<script setup>
import { computed,defineProps,defineEmits } from 'vue';

const props = defineProps({
  item: Object
});

const stockColor = computed(() => {
  if (props.item.unite === 'unite') {
    if (props.item.qteEnStock >= 10) return "green";
    if (props.item.qteEnStock >= 5) return "yellow";
    return "red";
  } else if (props.item.unite === 'litre') {
    if (props.item.qteEnStock >= 100) return "green";
    if (props.item.qteEnStock >= 50) return "yellow";
    return "red";
  } else if (props.item.unite === 'kg') {
    if (props.item.qteEnStock >= 20) return "green";
    if (props.item.qteEnStock >= 10) return "yellow";
    return "red";
  }
  // Pour les autres unités, on utilise la même logique que pour les unités
  if (props.item.qteEnStock >= 10) return "green";
  if (props.item.qteEnStock >= 5) return "yellow";
  return "red";
});

const handleClick = () => {
  emit("select", props.item);
};

const emit = defineEmits(['select']);
</script>

<style scoped>
.list-item {
  background-color: white;
  padding: 10px;
  margin-bottom: 5px;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}
.list-item:hover {
  background-color: #ddd;
}

.stock-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

/* Couleurs dynamiques */
.green {
  background-color: green;
}
.yellow {
  background-color: yellow;
}
.red {
  background-color: red;
}
</style>
