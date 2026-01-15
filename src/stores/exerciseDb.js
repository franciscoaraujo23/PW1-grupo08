import { defineStore } from "pinia";
import { exerciseDbApi } from "@/services/exerciseDbApi";

export const useExerciseDbStore = defineStore("exerciseDb", {
  state: () => ({
    q: "",
    results: [],
    loading: false,
    error: "",
    nextPage: null,
    prevPage: null,
  }),
  actions: {
    async search(q) {
      const query = String(q || "").trim();
      this.q = query;

      if (!query) {
        this.results = [];
        this.nextPage = null;
        this.prevPage = null;
        this.error = "";
        return;
      }

      try {
        this.loading = true;
        this.error = "";
        const res = await exerciseDbApi.searchByName(query, { limit: 10, offset: 0 });
        this.results = res?.data ?? [];
        this.nextPage = res?.metadata?.nextPage ?? null;
        this.prevPage = res?.metadata?.previousPage ?? null;
      } catch (e) {
        this.results = [];
        this.nextPage = null;
        this.prevPage = null;
        this.error = e?.message || "Erro na ExerciseDB";
      } finally {
        this.loading = false;
      }
    },

    async next() {
      if (!this.nextPage) return;
      try {
        this.loading = true;
        this.error = "";
        const res = await exerciseDbApi.fetchUrl(this.nextPage);
        this.results = res?.data ?? [];
        this.nextPage = res?.metadata?.nextPage ?? null;
        this.prevPage = res?.metadata?.previousPage ?? null;
      } catch (e) {
        this.error = e?.message || "Erro na paginação";
      } finally {
        this.loading = false;
      }
    },

    async prev() {
      if (!this.prevPage) return;
      try {
        this.loading = true;
        this.error = "";
        const res = await exerciseDbApi.fetchUrl(this.prevPage);
        this.results = res?.data ?? [];
        this.nextPage = res?.metadata?.nextPage ?? null;
        this.prevPage = res?.metadata?.previousPage ?? null;
      } catch (e) {
        this.error = e?.message || "Erro na paginação";
      } finally {
        this.loading = false;
      }
    },
  },
});
