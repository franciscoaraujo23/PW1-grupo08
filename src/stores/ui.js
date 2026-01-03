import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    loading: false,
    toast: null // { type: 'info' | 'error' | 'success', message: string }
  }),
  actions: {
    setLoading(v) { this.loading = !!v },
    showToast(type, message) {
      this.toast = { type, message }
      setTimeout(() => { this.toast = null }, 2500)
    }
  }
})
