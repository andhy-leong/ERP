<script lang="ts">

import {defineComponent} from "vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true
    }
  }
})

</script>

<template>
  <div class="pop-up">
    <h2>{{ title }}</h2>
    <slot name="content">

      <!-- mettre le contenu ici -->

    </slot>
  </div>

</template>

<style scoped>

.pop-up {
  position: absolute;
  background-color: var(--base-200);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 150px;
}

</style>