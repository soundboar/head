<template>
  <div
    class="grid 2xl:grid-cols-12 xl:grid-cols-10 lg:grid-cols-8 md:grid-cols-6 sm:grid-cols-4 grid-cols-3 gap-4 quadratic m-2"
  >
    <SoundboardButton v-for="file of files" :key="file.id" :file="file" />
  </div>
  <div class="fixed left-0 right-0 bottom-0 z-10">
    <div
      class="absolute left-0 right-0 bottom-0 h-8 w-full bg-gradient-to-t from-[#0009] -z-10"
    ></div>
    <button
      class="btn btn-lg btn-neutral btn-circle ml-4 mb-2 text-4xl"
      v-show="STOPPABLE_STATES.has(state)"
      @click="player?.stop()"
    >
      &square;
    </button>
    <div class="dropdown dropdown-top dropdown-end float-right mr-4 mb-2 text-4xl pb-1">
      <div tabindex="0" role="button" class="btn btn-lg btn-neutral btn-circle">&plus;</div>
      <input
        ref="uploadInput"
        type="file"
        multiple
        accept="audio/mp3, audio/wav, audio/ogg, audio/flac"
        @change="addFile"
        class="hidden"
      />
      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li><a role="button" @click="uploadInput?.click()">Upload</a></li>
        <li><a role="button" @click="addFileFromWebsiteModal?.showModal()">From Website</a></li>
      </ul>
    </div>
  </div>
  <dialog ref="addFilesModal" class="modal" @close="filesToUpload = []">
    <div class="modal-box">
      <h3 class="font-bold text-lg">How do you want to name the buttons?</h3>
      <div class="modal-action">
        <form method="dialog" class="w-full">
          <label
            class="input input-bordered mb-2 flex items-center"
            v-for="(f, i) in filesToUpload"
          >
            <input type="text" class="grow" v-model="f[0]" />
            <button class="btn btn-xs btn-error" @click.prevent="filesToUpload.splice(i, 1)">
              -
            </button>
          </label>
          <button class="btn">Cancel</button>
          <button class="btn btn-primary float-right" @click="uploadFiles">Upload</button>
        </form>
      </div>
    </div>
  </dialog>
  <dialog ref="addFileFromWebsiteModal" class="modal" @close="resetWebsiteData">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Add a file from a website...</h3>
      <form method="dialog" class="w-full">
        <div class="w-full">
          <input
            type="url"
            class="input input-bordered mb-2 w-full"
            v-model="websiteToAddFrom"
            placeholder="https://..."
            @focusout="checkUrl"
          />
          <input
            type="text"
            class="input input-bordered mb-2 w-full"
            v-model="websiteSoundName"
            placeholder="Name"
          />
        </div>
        <div role="alert" class="alert alert-warning mb-2" v-show="websiteError">
          <span>{{ websiteError }}</span>
        </div>
        <button class="btn">Cancel</button>
        <button
          class="btn btn-primary float-right"
          @click="addFromWebsite"
          :disabled="websiteError || !websiteSoundName"
        >
          Add
        </button>
      </form>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import { inject, onBeforeUnmount, ref, type Ref, watch } from 'vue'
import { debounce } from '@/lib/util'
import { filesKey, playerKey } from '@/lib/keys'
import type { components } from '@/lib/api/types'
import type Player from '@/lib/player'
import SoundboardButton from '@/components/SoundboardButton.vue'
import { GET } from '@/lib/api'

const STOPPABLE_STATES = new Set<components['schemas']['State']>([
  'opening',
  'buffering',
  'playing',
  'paused'
])

const files = inject<Ref<components['schemas']['File'][]>>(filesKey, ref([]))
const player = inject<Ref<Player>>(playerKey)
const uploadInput = ref<HTMLInputElement>()
const addFilesModal = ref<HTMLDialogElement>()
const addFileFromWebsiteModal = ref<HTMLDialogElement>()
const filesToUpload = ref<[name: string, file: File][]>([])
const websiteToAddFrom = ref<string>('')
const websiteSoundName = ref<string>('')
const websiteError = ref<string>('')
const state = ref<components['schemas']['State']>('initiated')

watch(
  () => filesToUpload.value.length,
  (length) => {
    if (length === 0) {
      addFilesModal.value?.close()
    }
  }
)

function checkUrl() {
  let url: URL
  try {
    url = new URL(websiteToAddFrom.value)
  } catch (e) {
    websiteError.value = 'Invalid URL'
    return
  }
  GET('/meta/og-title/{website}', {
    params: { path: { website: url.toString() } }
  }).then(({ data, error }) => {
    if (error) {
      websiteError.value = 'Website does not reference/contain a sound'
    } else {
      websiteError.value = ''
      if (!websiteSoundName.value) {
        websiteSoundName.value = data!
      }
    }
  })
}

function stripFileEnding(filename: string) {
  const parts = filename.split('.')
  if (parts.length < 2) {
    return parts[0]
  }
  return parts.slice(0, parts.length - 1).join('.')
}

function addFile(payload: Event) {
  const el = payload.target as HTMLInputElement
  if (!el.files) {
    return
  }
  filesToUpload.value = [...el.files].map((f) => [stripFileEnding(f.name), f])
  addFilesModal.value?.showModal()
}

function addFromWebsite() {
  if (!websiteError.value) {
    player!.value
      .addFromWebsite(websiteToAddFrom.value, websiteSoundName.value)
      .then(({ data }) => {
        files.value.splice(data![1], 0, data![0])
        resetWebsiteData()
      })
  }
}

function resetWebsiteData() {
  websiteError.value = ''
  websiteSoundName.value = ''
  websiteToAddFrom.value = ''
}

async function uploadFiles() {
  for (const [name, file] of filesToUpload.value) {
    const promise = player!.value.add(name, file)
    promise.then(({ data }) => {
      files.value.splice(data![1], 0, data![0])
    })
  }
}

function updateStopButton() {
  debounce(() => {
    GET('/state').then(({ data }) => {
      if (data) {
        state.value = data
      }
    })
  }, 50)
}

player?.value.events.addEventListener('statechange', updateStopButton)

onBeforeUnmount(() => {
  player?.value.events.removeEventListener('statechange', updateStopButton)
})
</script>
