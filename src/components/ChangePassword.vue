<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">Change Password</h1>

      <!-- Error Message -->
      <div v-if="errorMessage" class="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleChangePassword">
        <!-- Old Password -->
        <div class="mb-6">
          <label for="oldPassword" class="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
          <input
            type="password"
            id="oldPassword"
            v-model="oldPassword"
            placeholder="Enter your old password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- New Password -->
        <div class="mb-6">
          <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            id="newPassword"
            v-model="newPassword"
            placeholder="Enter your new password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p class="text-xs text-gray-500 mt-2">Password must be at least 8 characters long.</p>
        </div>

        <!-- Save Button -->
        <div class="flex justify-center">
          <button
            type="submit"
            class="w-full px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from './urls';

const router = useRouter();
const newPassword = ref('');
const oldPassword = ref('');
const errorMessage = ref('');

const handleChangePassword = async () => {
  // Reset error message
  errorMessage.value = '';

  // Validation
  if (oldPassword.value.trim() === "" || newPassword.value.trim() === "") {
    errorMessage.value = "All fields are required.";
    return;
  }

  if (newPassword.value.length < 8) {
    errorMessage.value = "Password must be at least 8 characters long.";
    return;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/change-password/`, {
      old_password: oldPassword.value,
      new_password: newPassword.value,
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Include your auth token
      }
    });
    
    alert(response.data.message); // Show success message
    router.push({ name: 'dashboard' }); // Redirect to dashboard after success
  } catch (error) {
    if (error.response && error.response.data) {
      errorMessage.value = Object.values(error.response.data).flat().join(', '); // Handle error messages
    } else {
      errorMessage.value = "An error occurred. Please try again.";
    }
  }
};
</script>

<style scoped>
/* Add any additional styles if necessary */
</style>