<template>
  <div class="grid-cols-1 swap swap-flip cursor-auto" :class="{ 'swap-active': editFile }">
    <div
      class="swap-off card shadow p-4 bg-neutral-content text-neutral w-full overflow-hidden"
      @mouseenter="checkOverflow"
    >
      <button class="absolute right-0 top-0 pr-2 pt-0.5" @click="editFile = true">☰</button>
      <button
        class="btn btn-lg btn-circle mx-auto mb-2 btn-play"
        @click="player?.play(file.id)"
      ></button>
      <div
        class="whitespace-nowrap overflow-hidden text-center -mx-1 relative fade-before fade-after"
        :class="{ marquee: isOverflowing }"
      >
        <span ref="marqueeContent" class="inline-block relative"
          ><span class="inline-block mx-1">{{ file.name }}</span></span
        >
      </div>
    </div>
    <div class="swap-on card shadow p-4 bg-neutral-content text-neutral">
      <button class="absolute right-0 top-0 pr-2 pt-0.5" @click="editFile = false">&times;</button>
      <a class="btn btn-block btn-neutral btn-sm mb-1" :href="player?.downloadUrl(file.id)" @click="editFile = false">Download</a>
      <button class="btn btn-block btn-error btn-sm" @click="del()">Delete</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { inject, ref, type Ref } from 'vue'
import type Player from '@/lib/player'
import { filesKey, playerKey } from '@/lib/keys'
import type { components } from '@/lib/api/types'

const props = defineProps<{ file: components['schemas']['File'] }>()
const player = inject<Ref<Player>>(playerKey)
const editFile = ref(false)
const isOverflowing = ref(false)
const marqueeContent = ref<HTMLParagraphElement>()
const files = inject<Ref<components['schemas']['File'][]>>(filesKey, ref([]))

function checkOverflow() {
  const m = marqueeContent.value!
  const p = m.parentNode as HTMLDivElement
  isOverflowing.value = p.clientWidth < m.clientWidth
}

function download() {
  player!.value.download(props.file.id).then(({ data }) => {
    if (data) {
      const blob = URL.createObjectURL(data);
      window.location.replace(blob);
    }
  })

}

function del() {
  const i = files.value.indexOf(props.file)
  player?.value.delete(props.file.id).catch((e) => {
    console.error(e)
    files.value.splice(i, 0, props.file)
  })
  files.value.splice(files.value.indexOf(props.file), 1)
}
</script>
