<template>
  <div>
    <h2>User Registration</h2>
    <form @submit.prevent="submitForm">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="form.username" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="form.password" required />
      </div>
      <div>
        <label for="firstName">First Name:</label>
        <input type="text" id="firstName" v-model="form.firstName" required />
      </div>
      <div>
        <label for="lastName">Last Name:</label>
        <input type="text" id="lastName" v-model="form.lastName" required />
      </div>
      <div>
        <label for="birthday">Birthday:</label>
        <input type="date" id="birthday" v-model="form.birthday" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="form.email" required />
      </div>
      <button type="submit">Register</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  birthday: '',
  email: ''
})

let message = ref('')

async function submitForm() {
  try {
    const response = await fetch('http://localhost:3001/api/createprofile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    if (!response.ok) {
      throw new Error('Registration failed')
    }

    const data = await response.json()
    console.log(data)

    message.value = 'Registration successful'
  } catch (error) {
    console.error(error) // Print error information for debugging
    message.value = 'Registration failed: ' + error.message
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
select,
button {
  margin: 5px 0;
}

button {
  cursor: pointer;
}
</style>
