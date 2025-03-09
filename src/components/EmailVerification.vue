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
                v-model="userEmail" 
                type="email" 
                placeholder="Enter your email address" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              @click="resendVerificationEmail"
              class="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              :disabled="!isValidEmail"
            >
              Resend Verification Email
            </button>
            <button
              @click="goToRegister"
              class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back to Registration
            </button>
          </div>
        </div>
      </div>
      
      <!-- Debug information section (hidden in production) -->
      <div v-if="showDebug" class="mt-8 p-4 border border-gray-300 rounded-md bg-gray-50">
        <h3 class="font-bold text-gray-700 mb-2">Debug Information</h3>
        <pre class="text-xs overflow-auto">Token: {{ debugToken }}\nEmail: {{ debugEmail }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from '@/components/urls.js';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const success = ref(false);
const message = ref('');
const error = ref('');
const userEmail = ref('');
const showDebug = ref(false); // Set to true during development to show debug info
const debugToken = ref('');
const debugEmail = ref('');

// Email validation
const isValidEmail = computed(() => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(userEmail.value);
});

const verifyEmail = async () => {
  // Extract token from URL
  const token = route.query.token;
  
  // Extract email from URL (if provided)
  const emailFromUrl = route.query.email;
  if (emailFromUrl) {
    userEmail.value = emailFromUrl;
    debugEmail.value = emailFromUrl;
  }
  
  // For debugging
  debugToken.value = token;
  console.log('Token from URL:', token);
  console.log('Email from URL:', emailFromUrl);

  // Validate token
  if (!token || token === 'None' || token === 'undefined') {
    error.value = 'Invalid or missing verification token. Please check the link in your email.';
    loading.value = false;
    return;
  }

  try {
    // Call the API to verify the email
    const apiUrl = `${API_BASE_URL}/verify-email/${token}`;
    console.log('Calling API:', apiUrl);
    
    const response = await axios.get(apiUrl);
    success.value = true;
    message.value = response.data.message || 'Your email has been successfully verified.';

    // Start redirection timer
    setTimeout(() => {
      goToLogin();
    }, 5000);
  } catch (err) {
    console.error('Verification error:', err);
    success.value = false;
    
    // Handle different error scenarios
    if (err.response?.status === 404) {
      error.value = 'Verification token not found. It may have expired or been used already.';
    } else if (err.response?.status === 400) {
      error.value = err.response.data.error || 'Invalid verification token.';
    } else {
      error.value = 'An error occurred during email verification. Please try again later.';
    }
  } finally {
    loading.value = false;
  }
};

const resendVerificationEmail = async () => {
  if (!isValidEmail.value) {
    alert('Please enter a valid email address.');
    return;
  }

  try {
    loading.value = true;
    console.log('Resending verification to:', userEmail.value);
    
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

const goToLogin = () => {
  router.push({ name: 'login' });
};

const goToRegister = () => {
  router.push({ name: 'register' });
};

onMounted(() => {
  console.log('Component mounted');
  console.log('Route query parameters:', route.query);
  
  // Try to get email from localStorage if not in URL
  if (!route.query.email && localStorage.getItem('registrationEmail')) {
    userEmail.value = localStorage.getItem('registrationEmail');
    debugEmail.value = userEmail.value;
  }
  
  verifyEmail();
});
</script>