<template>
  <div class="grid-item" :style="gridStyle">
    <slot>
      <p>{{ content }}</p>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  props: {
    type: String,
    width: Number,
    height: Number,
    index: {
      type: Number,
      default: 0,
    },
    content: String
  },
  setup(props) {
    const colStart = computed(() => ((props.index - 1) % 6) + 1);
    const rowStart = computed(() => Math.floor((props.index - 1) / 6) + 1);
    const gridStyle = ref(computed(() => ({
    gridColumn: `${colStart.value}/ span ${props.width}`,
    gridRow: `${rowStart.value} / span ${props.height}`,
    })));
    const text = ref(props.content);

    return {text,gridStyle};
  }
});
</script>

<style scoped>
.grid-item {
  position: relative;
  background: var(--base-200);
  border: 1px solid var(--base-900);
}
</style>