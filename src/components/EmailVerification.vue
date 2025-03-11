<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <div class="flex justify-center mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p class="text-gray-700">Verifying your email address...</p>
      </div>
      
      <!-- Content after loading -->
      <div v-else>
        <!-- Success State -->
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
        
        <!-- Verification Form State -->
        <div v-else class="text-center">
          <div class="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-blue-600 mb-4">Email Verification</h2>
          
          <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {{ error }}
          </div>
          
          <p class="text-gray-700 mb-4">
            Please enter the verification PIN sent to 
            <span class="font-semibold">{{ maskedEmail }}</span>
          </p>
          
          <div class="space-y-4">
            <div>
              <input 
                v-model="pin" 
                type="text" 
                placeholder="Enter your verification PIN" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxlength="6"
              />
            </div>
            <button
              @click="verifyEmail"
              class="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Verify Email
            </button>
            
            <div class="pt-2 text-center">
              <p class="text-gray-600 text-sm mb-2">Didn't receive a verification PIN?</p>
              <button
                @click="resendVerificationEmail"
                class="text-blue-500 hover:text-blue-700 transition-colors text-sm font-medium"
                :disabled="resendCooldown > 0"
              >
                {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
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
const resendCooldown = ref(0);

// Mask email for privacy
const maskedEmail = computed(() => {
  if (!userEmail.value) return '';
  
  const parts = userEmail.value.split('@');
  if (parts.length !== 2) return userEmail.value;
  
  const name = parts[0];
  const domain = parts[1];
  
  // Show first 2 chars and last char of the username, rest as asterisks
  const maskedName = name.length <= 3 
    ? name 
    : `${name.substring(0, 2)}${'*'.repeat(name.length - 3)}${name.substring(name.length - 1)}`;
    
  return `${maskedName}@${domain}`;
});

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

// Resend verification email with cooldown
const resendVerificationEmail = async () => {
  if (resendCooldown.value > 0) return;
  
  try {
    loading.value = true;
    const response = await axios.post(`${API_BASE_URL}/resend-verification-email/`, {
      email: userEmail.value
    });

    // Show success message
    error.value = ''; // Clear any previous errors
    message.value = 'Verification email has been resent. Please check your inbox and spam folder.';
    
    // Start cooldown
    startResendCooldown();
    
  } catch (err) {
    console.error('Resend error:', err);

    if (err.response?.status === 404) {
      error.value = 'Email address not found. Please check if you entered the correct email.';
    } else if (err.response?.status === 400) {
      error.value = err.response.data.error || 'Failed to resend verification email.';
    } else {
      error.value = 'Failed to resend verification email. Please try again later.';
    }
  } finally {
    loading.value = false;
  }
};

// Cooldown timer for resend button
const startResendCooldown = () => {
  resendCooldown.value = 60; // 60 seconds cooldown
  
  const timer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

// Redirect to login page
const goToLogin = () => {
  router.push({ name: 'login' });
};

// On component mount
onMounted(() => {
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