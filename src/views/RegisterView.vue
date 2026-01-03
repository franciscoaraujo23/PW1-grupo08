<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

function submit() {
  error.value = ''
  try {
    ui.setLoading(true)
    auth.register({ name: name.value, email: email.value, password: password.value })
    ui.showToast('success', 'Conta criada.')
    router.push('/dashboard')
  } catch (e) {
    error.value = e?.message || 'Erro no registo.'
    ui.showToast('error', error.value)
  } finally {
    ui.setLoading(false)
  }
}
</script>

<template>
  <section class="card" style="max-width:520px; margin: 40px auto;">
    <h1 style="margin:0 0 6px;">Register</h1>
    <p class="small" style="margin-top:0;">Cria a tua conta (mock por agora).</p>

    <div style="margin-top:14px;">
      <label class="label">Nome</label>
      <input class="input" v-model="name" placeholder="João" />
    </div>

    <div style="margin-top:12px;">
      <label class="label">Email</label>
      <input class="input" v-model="email" type="email" placeholder="ex: joao@teste.com" />
    </div>

    <div style="margin-top:12px;">
      <label class="label">Password</label>
      <input class="input" v-model="password" type="password" placeholder="••••••••" />
    </div>

    <p v-if="error" class="error" style="margin-top:10px;">{{ error }}</p>

    <div style="display:flex; gap:10px; margin-top:14px;">
      <button class="btn btn-primary" @click="submit">Criar conta</button>
      <button class="btn" @click="router.push('/login')">Voltar ao login</button>
    </div>
  </section>
</template>
