<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <p class="text-gray-700">Verifying your email...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="text-center">
        <h2 class="text-2xl font-bold text-green-600 mb-4">Email Verified Successfully!</h2>
        <p class="text-gray-700">{{ message }}</p>
      </div>

      <!-- Error State -->
      <div v-else class="text-center">
        <h2 class="text-2xl font-bold text-red-600 mb-4">Email Verification Failed</h2>
        <p class="text-gray-700 mb-6">{{ error }}</p>

        <!-- Resend Verification Email Button -->
        <button
          @click="resendVerificationEmail"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Resend Verification Email
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from '@/components/urls.js';

// Router and Route
const route = useRoute();
const router = useRouter();

// Reactive State
const loading = ref(true); // Loading state
const success = ref(false); // Success state
const message = ref(''); // Success message
const error = ref(''); // Error message

// Verify Email Function
const verifyEmail = async () => {
  const token = route.query.token; // Extract token from URL

  // Check if token is missing
  if (!token) {
    error.value = 'Invalid or missing verification token.';
    loading.value = false;
    return;
  }

  try {
    // Call the backend to verify the email
    const response = await axios.get(`${API_BASE_URL}/verify-email/${token}/`);
    success.value = true;
    message.value = response.data.message;

    // Redirect to login page after 3 seconds
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 3000);
  } catch (err) {
    // Handle errors
    success.value = false;
    error.value = err.response?.data?.error || 'An error occurred during email verification.';
  } finally {
    loading.value = false;
  }
};

// Resend Verification Email Function
const resendVerificationEmail = async () => {
  try {
    // Call the backend to resend the verification email
    await axios.post(`${API_BASE_URL}/resend-verification-email/`, {
      email: route.query.email, // Pass the user's email
    });
    alert('Verification email resent. Please check your inbox.');
  } catch (err) {
    alert('Failed to resend verification email. Please try again later.');
  }
};

// On Component Mount
onMounted(() => {
  verifyEmail(); // Automatically verify email when the component mounts
});
</script>