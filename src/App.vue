<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import api from '@/lib/api'
import { provide, ref } from 'vue'
import { type components } from '@/lib/api/types'
import { filesKey, playerKey } from '@/lib/keys'
import Player from '@/lib/player'

const files = ref<components['schemas']['File'][]>([])
const player = ref<Player>(new Player())

api.GET('/files').then(({ data }) => {
  files.value = Object.values(data!)
})

provide(filesKey, files)
provide(playerKey, player)
</script>
