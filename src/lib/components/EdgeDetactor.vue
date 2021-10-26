<script setup lang="ts">
import { Detactors } from 'src/interface';
import {
  defineProps, defineEmits,
  onMounted, onBeforeUnmount,
  ref,
} from 'vue'

const props = defineProps<{
  detactorId: Detactors,
  threshold: number,
}>()
const emit = defineEmits<{
  (e: 'edgeDetacted', value: Detactors): void
}>();

const threshold = props.threshold || 0.8
const handleEnterObserver = (
  entris: IntersectionObserverEntry[]
) => {
  entris.forEach((entiry) => {
    const { intersectionRatio, isIntersecting } = entiry;
    if (isIntersecting) {
      if (intersectionRatio >= threshold) {
        emit('edgeDetacted', props.detactorId)
      }
    }
  })
}
const detactor = ref<HTMLElement>()
const observer = new IntersectionObserver(handleEnterObserver, {
  threshold
})

onMounted(() => {
  if (detactor.value) {
    observer.observe(detactor.value)
  }
})

onBeforeUnmount(() => {
  observer.disconnect();
})


</script>
<template>
  <div class="detactor" ref="detactor">
    <slot />
  </div>
</template>
<style lang='sass' scoped>

</style>