import client, { baseUrl, DELETE, GET, POST } from '@/lib/api'
import PlayerEvents from '@/lib/playerEvents'

export default class Player {
  events: PlayerEvents

  constructor() {
    this.events = PlayerEvents.create()
  }

  play(fileId: string) {
    return POST('/play/{file_id}', { params: { path: { file_id: fileId } } })
  }

  add(requestFileId: string, file: File) {
    return POST('/file/{request_file_id}', {
      params: { path: { request_file_id: requestFileId } },
      body: { file: '' }, // placeholder
      bodySerializer: () => {
        const formData = new FormData()
        formData.set('file', file)
        return formData
      }
    })
  }

  delete(fileId: string) {
    return DELETE('/file/{file_id}', { params: { path: { file_id: fileId } } })
  }

  stop() {
    return POST('/stop')
  }

  downloadUrl(fileId: string) {
    return `${baseUrl}/download/${fileId}`
  }

  download(fileId: string) {
    return GET('/download/{file_id}', { params: { path: { file_id: fileId }}, parseAs: "blob"})
  }

  addFromWebsite(website: string, requestFileId: string) {
    return POST('/upload_from_url/{request_file_id}/{website}', {
      params: { path: { request_file_id: requestFileId, website } }
    })
  }
}
