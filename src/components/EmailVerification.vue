<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div v-if="loading" class="text-center">
        <div class="flex justify-center mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p class="text-gray-700">Verifying your email address...</p>
      </div>
      <div v-else>
        <div v-if="success" class="text-center">
          <div class="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-green-600 mb-4">Email Verified Successfully!</h2>
          <p class="text-gray-700 mb-4">{{ message }}</p>
          <p class="text-gray-600">Redirecting to login page...</p>
          <div class="mt-6">
            <button
              @click="goToLogin"
              class="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
        <div v-else class="text-center">
          <div class="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-red-600 mb-4">Email Verification Failed</h2>
          <p class="text-gray-700 mb-6">{{ error }}</p>
          
          <div class="space-y-4">
            <div>
              <input 
                v-model="pin" 
                type="text" 
                placeholder="Enter your verification PIN" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              @click="verifyEmail"
              class="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Verify Email
            </button>
            <button
              @click="resendVerificationEmail"
              class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Resend Verification Email
            </button>
          </div>
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
const pin = ref('');
const userEmail = ref('');

// Verify email using the entered PIN
const verifyEmail = async () => {
  if (!pin.value) {
    error.value = 'Please enter the verification PIN.';
    return;
  }

  try {
    loading.value = true;
    const response = await axios.post(`${API_BASE_URL}/verify-email/`, {
      email: userEmail.value,
      pin: pin.value
    });

    success.value = true;
    message.value = response.data.message || 'Your email has been successfully verified.';

    // Start redirection timer
    setTimeout(() => {
      goToLogin();
    }, 5000);
  } catch (err) {
    console.error('Verification error:', err);
    success.value = false;

    if (err.response?.status === 400) {
      error.value = err.response.data.error || 'Invalid or expired verification PIN.';
    } else {
      error.value = 'An error occurred during email verification. Please try again later.';
    }
  } finally {
    loading.value = false;
  }
};

// Resend verification email
const resendVerificationEmail = async () => {
  try {
    loading.value = true;
    const response = await axios.post(`${API_BASE_URL}/resend-verification-email/`, {
      email: userEmail.value
    });

    alert('Verification email has been resent. Please check your inbox and spam folder.');
    console.log('Resend response:', response.data);
  } catch (err) {
    console.error('Resend error:', err);

    if (err.response?.status === 404) {
      alert('Email address not found. Please check if you entered the correct email.');
    } else if (err.response?.status === 400) {
      alert(err.response.data.error || 'Failed to resend verification email.');
    } else {
      alert('Failed to resend verification email. Please try again later.');
    }
  } finally {
    loading.value = false;
  }
};

// Redirect to login page
const goToLogin = () => {
  router.push({ name: 'login' });
};

// On component mount
onMounted(() => {
  console.log('Component mounted');
  console.log('Route query parameters:', route.query);

  // Set email from query parameters or localStorage
  if (route.query.email) {
    userEmail.value = route.query.email;
  } else if (localStorage.getItem('registrationEmail')) {
    userEmail.value = localStorage.getItem('registrationEmail');
  }

  // Automatically verify if PIN is provided in the URL
  if (route.query.pin) {
    pin.value = route.query.pin;
    verifyEmail();
  } else {
    loading.value = false;
  }
});
</script>