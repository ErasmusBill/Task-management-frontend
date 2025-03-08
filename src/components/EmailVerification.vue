<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div v-if="loading" class="text-center">
        <p class="text-gray-700">Verifying your email...</p>
      </div>
      <div v-else>
        <div v-if="success" class="text-center">
          <h2 class="text-2xl font-bold text-green-600 mb-4">Email Verified Successfully!</h2>
          <p class="text-gray-700">{{ message }}</p>
        </div>
        <div v-else class="text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Email Verification Failed</h2>
          <p class="text-gray-700 mb-6">{{ error }}</p>
          <button
            @click="resendVerificationEmail"
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from '@/components/urls.js';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const success = ref(false);
const message = ref('');
const error = ref('');

const verifyEmail = async () => {
  const token = route.query.token; // Get the token from the URL
  try {
    const response = await axios.get(`${API_BASE_URL}/verify-email/${token}/`);
    success.value = true;
    message.value = response.data.message;

    // Redirect to the login page after 3 seconds
    setTimeout(() => {
      router.push({ name: 'login' }); // Replace 'Login' with the name of your login route
    }, 3000);
  } catch (err) {
    success.value = false;
    error.value = err.response?.data?.error || 'An error occurred during email verification.';
  } finally {
    loading.value = false;
  }
};

const resendVerificationEmail = async () => {
  try {
    // Replace with your API endpoint for resending the verification email
    await axios.post(`${API_BASE_URL}/resend-verification-email/`, {
      email: route.query.email, // Pass the user's email if available
    });
    alert('Verification email resent. Please check your inbox.');
  } catch (err) {
    alert('Failed to resend verification email. Please try again later.');
  }
};

onMounted(() => {
  verifyEmail();
});
</script>