<template>
  <div>
    <h2>User Login</h2>
    <form @submit.prevent="submitForm">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="form.username" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="form.password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  username: '',
  password: ''
})

const message = ref('')

const submitForm = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/loginprofile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    const data = await response.json()
    console.log(data)
    localStorage.setItem('token', data.token)
    alert('Login successful')
    message.value = 'Login successful'
  } catch (error) {
    message.value = 'Login failed'
  }
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: auto;
}

input,
button {
  margin: 5px 0;
}

button {
  cursor: pointer;
}
</style>
