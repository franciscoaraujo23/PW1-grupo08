import { defineStore } from "pinia";
import { api } from "@/services/api";

export const useWorkoutExercisesStore = defineStore("workoutExercises", {
  state: () => ({
    itemsByWorkout: {}, // workoutId -> []
  }),
  getters: {
    list: (s) => (workoutId) => s.itemsByWorkout[workoutId] ?? [],
  },
  actions: {
    async fetchByWorkout(workoutId) {
      const { data } = await api.get(`/workoutExercises?workoutId=${workoutId}`);
      this.itemsByWorkout[workoutId] = data;
    },

    async add(workoutId, ex) {
      const payload = {
        id: crypto.randomUUID(),
        workoutId,
        exerciseId: ex.exerciseId,          // v1 field
        name: ex.name,
        gifUrl: ex.gifUrl ?? null,
        bodyPart: ex.bodyParts?.[0] ?? null,
        target: ex.targetMuscles?.[0] ?? null,
        equipment: ex.equipments?.[0] ?? null,
        sets: 3,
        reps: 10,
        createdAt: new Date().toISOString(),
      };

      const { data } = await api.post("/workoutExercises", payload);
      if (!this.itemsByWorkout[workoutId]) this.itemsByWorkout[workoutId] = [];
      this.itemsByWorkout[workoutId].push(data);
      return data;
    },

    async remove(workoutId, id) {
      await api.delete(`/workoutExercises/${id}`);
      this.itemsByWorkout[workoutId] = (this.itemsByWorkout[workoutId] ?? []).filter(x => x.id !== id);
    },
  },
});