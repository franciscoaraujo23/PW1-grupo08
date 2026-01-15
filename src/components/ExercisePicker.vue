<script setup>
import { ref, watch } from "vue";
import { useExerciseDbStore } from "@/stores/exerciseDb";
import { useWorkoutExercisesStore } from "@/stores/workoutExercises";
import { useUiStore } from "@/stores/ui";

const props = defineProps({ workoutId: { type: String, required: true } });

const exdb = useExerciseDbStore();
const wx = useWorkoutExercisesStore();
const ui = useUiStore();

const q = ref("");

let t;
watch(q, (v) => {
  clearTimeout(t);
  t = setTimeout(() => exdb.search(v), 350);
});

async function add(ex) {
  await wx.add(props.workoutId, ex);
  ui.showToast("success", "Exercício adicionado.");
}

function resolveGif(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://static.exercisedb.dev${url}`;
}

</script>

<template>
  <div class="card" style="padding:12px;">
    <strong>Adicionar exercícios (ExerciseDB)</strong>

    <input class="input" v-model="q" placeholder="Pesquisar (ex: row, bench, squat)" style="margin-top:10px;" />

    <p class="small" v-if="exdb.loading" style="margin-top:8px;">A pesquisar…</p>
    <p class="error" v-if="exdb.error" style="margin-top:8px;">{{ exdb.error }}</p>

    <div v-if="exdb.results.length" style="margin-top:10px; display:grid; gap:10px;">
      <div v-for="ex in exdb.results" :key="ex.exerciseId" class="card" style="padding:10px; display:flex; gap:12px;">
        <img v-if="ex.gifUrl" :src="resolveGif(ex.gifUrl)" width="72" height="72" style="border-radius:10px;" />
        <div style="flex:1;">
          <div><strong>{{ ex.name }}</strong></div>
          <div class="small">
            {{ (ex.bodyParts?.[0] ?? '-') }} • {{ (ex.targetMuscles?.[0] ?? '-') }} • {{ (ex.equipments?.[0] ?? '-') }}
          </div>
        </div>
        <button class="btn btn-primary" @click="add(ex)">Adicionar</button>
      </div>

      <div style="display:flex; gap:10px; justify-content:flex-end;">
        <button class="btn" :disabled="!exdb.prevPage || exdb.loading" @click="exdb.prev()">Anterior</button>
        <button class="btn" :disabled="!exdb.nextPage || exdb.loading" @click="exdb.next()">Seguinte</button>
      </div>
    </div>
  </div>
</template>
