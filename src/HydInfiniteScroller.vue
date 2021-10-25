<script setup lang='ts'>
import {
  defineEmits, defineProps,
  ref, computed,
  onMounted,
  nextTick,
} from 'vue'
import { Detactors, LoadDataFinish, LoadDirection } from './interface.d';
import EdgeDetactor from './lib/components/EdgeDetactor.vue';
const props = defineProps<{
  threshold: number;
  detactTop: boolean;
  detactBottom: boolean;
  controlPause?: boolean;
}>();

const container = ref<HTMLElement>();

const selfInitLock = ref(true);
const initLock = computed(() => {
  if (typeof props.controlPause === 'boolean') return selfInitLock.value || props.controlPause;
  return selfInitLock.value;
})

// emit load event

let emitInstanceLock:LoadDirection|undefined;
let stashEmit:Detactors|undefined;
const emits = defineEmits<{
  (e: 'loadMore', direction: LoadDirection, finish: LoadDataFinish): void;
  (e: 'initList', finish: (value: unknown) => void): void;
}>();
const whenLoadFinish = () => {
  emitInstanceLock = undefined;
  stashEmit = undefined;
}
const topAppendHide = ref(false);
const edgeDetacted = async (detactorId: Detactors) => {
  if (initLock.value) return;
  let loadDirction = detactorId === Detactors.Top
    ? LoadDirection.Top
    : LoadDirection.Bottom;

  // if detacted another side load, stash detacted to use when previous load finished
  if (emitInstanceLock) {
    if (loadDirction !== emitInstanceLock) {
      stashEmit = detactorId;
    }
    return;
  };

  // set single dirction lock
  emitInstanceLock = loadDirction

  // when load from top, need scroll down first,
  if (loadDirction === LoadDirection.Top) {
    topAppendHide.value = true;
    if (!container.value) return;
    await nextTick();
    container.value.scrollTo(0, 1)
  }
  // start to load
  emits(
    'loadMore',
    loadDirction,
    async () => {
      if (stashEmit !== undefined) {
        await nextTick();
        let stashedDetacted = stashEmit
        whenLoadFinish();
        edgeDetacted(stashedDetacted)
      } else {
        whenLoadFinish();
      }
      await nextTick();
      topAppendHide.value = false;
    }
  )
}

const init = () => new Promise<void>((resolve) => {
  selfInitLock.value = true;
  emits('initList', async () => {
    await nextTick();
    selfInitLock.value = false;
    resolve()
  })
})
onMounted(init)

const scroller = ref<HTMLElement>();
const scrollToBottom = (smooth?: boolean) => {
  if (container.value && scroller.value) {
    const height = scroller.value.scrollHeight;
    container.value.scrollTo({
      top: height,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }
}
const getContainer = () => undefined;
const scrollTo = (position: number) => {
  if (container.value) {
    container.value.scrollTo(0, position);
  }
}
defineExpose({
  init,
  scrollTo,
  scrollToBottom,
  getContainer
})
</script>
<template>
  <div class="infinite-scroller-container" ref="container">
    <edge-detactor
      v-if="detactTop && !topAppendHide"
      :detactor-id="Detactors.Top"
      :threshold="threshold"
      @edge-detacted="edgeDetacted"
    >
      <slot name="topDetactor"/>
    </edge-detactor>
    <div class="infinite-scroller" ref="scroller">
      <slot />
    </div>
    <edge-detactor
      v-if="detactBottom"
      :detactor-id="Detactors.Bottom"
      :threshold="threshold"
      @edge-detacted="edgeDetacted"
    >
      <slot name="bottomDetactor"/>
    </edge-detactor>
  </div>
</template>