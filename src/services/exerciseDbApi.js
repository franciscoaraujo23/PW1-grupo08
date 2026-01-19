const BASE_URL = "https://oss.exercisedb.dev/api/v1";

async function http(path) {
  const res = await fetch(BASE_URL + path);
  if (!res.ok) throw new Error(`ExerciseDB ${res.status}`);
  return res.json();
}

export const exerciseDbApi = {
  // devolve { success, metadata, data }
  searchByName: (q, { limit = 10, offset = 0 } = {}) =>
    http(`/exercises?name=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`),

  // paginação útil (usar nextPage)
  fetchUrl: (url) => fetch(url).then(r => {
    if (!r.ok) throw new Error(`ExerciseDB ${r.status}`);
    return r.json();
  }),
};