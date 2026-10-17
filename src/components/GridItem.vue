<template>
  <div class="grid-item" :style="gridStyle">
    <slot>
      <p>{{ content }}</p>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'GridItem',
  props: {
    type: [String, Object],
    width: {
      type: Number,
      default: 1
    },
    height: {
      type: Number,
      default: 1
    },
    index: {
      type: Number,
      default: 1,
    },
    content: String
  },
  setup(props) {
    const colStart = computed(() => ((props.index - 1) % 6) + 1);
    const rowStart = computed(() => Math.floor((props.index - 1) / 6) + 1);
    
    const gridStyle = computed(() => {
      // Si on est dans un mode étendu (width=6 et height=4), occupe toute la grille
      if (props.width >= 6 && props.height >= 4) {
        return {
          gridColumn: '1 / -1',
          gridRow: '1 / -1',
          width: '100%',
          height: '100%'
        };
      }
      return {
        gridColumn: `${colStart.value} / span ${props.width}`,
        gridRow: `${rowStart.value} / span ${props.height}`,
      };
    });

    return { gridStyle };
  }
});
</script>

<style scoped>
.grid-item {
  position: relative;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
</style>