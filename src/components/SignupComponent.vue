<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// Reactive form state
const formState = reactive({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  password2: '',
  errors: {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    password2: '',
  },
  isSubmitting: false,
});

// Email validation using regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Form validation function
const validateForm = () => {
  // Reset all errors
  Object.keys(formState.errors).forEach((key) => {
    formState.errors[key] = '';
  });

  let isValid = true;

  // Username validation
  if (!formState.username.trim()) {
    formState.errors.username = 'Username is required';
    isValid = false;
  }

  // Email validation
  if (!formState.email.trim()) {
    formState.errors.email = 'Email is required';
    isValid = false;
  } else if (!isValidEmail(formState.email)) {
    formState.errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  // First name validation
  if (!formState.firstName.trim()) {
    formState.errors.firstName = 'First name is required';
    isValid = false;
  }

  // Last name validation
  if (!formState.lastName.trim()) {
    formState.errors.lastName = 'Last name is required';
    isValid = false;
  }

  // Password validation
  if (!formState.password) {
    formState.errors.password = 'Password is required';
    isValid = false;
  } else if (formState.password.length < 8) {
    formState.errors.password = 'Password must be at least 8 characters';
    isValid = false;
  }

  // Password confirmation validation
  if (!formState.password2) {
    formState.errors.password2 = 'Please confirm your password';
    isValid = false;
  } else if (formState.password !== formState.password2) {
    formState.errors.password2 = 'Passwords do not match';
    isValid = false;
  }

  return isValid;
};

// Handle form submission
const handleSignup = async (event) => {
  event.preventDefault();
  formState.isSubmitting = true;

  if (validateForm()) {
    try {
      // Prepare the data for the API request
      const userData = {
        username: formState.username,
        email: formState.email,
        first_name: formState.firstName,
        last_name: formState.lastName,
        password: formState.password,
        password2: formState.password2,
      };

      // Make the API call to Django backend
      const response = await axios.post('http://127.0.0.1:8000/api/create/', userData);

      // Handle successful response
      if (response.status === 201) {
        alert('Account created successfully!');
        router.push('/'); // Redirect to the login page
      }
    } catch (error) {
      // Handle errors from the API
      if (error.response) {
        // Backend validation errors
        const errors = error.response.data;
        for (const key in errors) {
          if (formState.errors.hasOwnProperty(key)) {
            formState.errors[key] = errors[key].join(' ');
          }
        }
      } else {
        // Network or other errors
        alert('An error occurred. Please try again.');
      }
    } finally {
      formState.isSubmitting = false;
    }
  } else {
    formState.isSubmitting = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
      <div class="px-6 py-8">
        <h2 class="text-3xl font-bold text-center text-blue-600 mb-6">Create Your Account</h2>

        <form @submit="handleSignup" class="space-y-5">
          <!-- Username Field -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="username"
              type="text"
              v-model="formState.username"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              :class="{ 'border-red-300 bg-red-50': formState.errors.username }"
              placeholder="Choose a username"
            />
            <p v-if="formState.errors.username" class="mt-1 text-sm text-red-600">{{ formState.errors.username }}</p>
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              v-model="formState.email"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              :class="{ 'border-red-300 bg-red-50': formState.errors.email }"
              placeholder="your.email@example.com"
            />
            <p v-if="formState.errors.email" class="mt-1 text-sm text-red-600">{{ formState.errors.email }}</p>
          </div>

          <!-- Name Fields (Side by Side) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                id="firstName"
                type="text"
                v-model="formState.firstName"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                :class="{ 'border-red-300 bg-red-50': formState.errors.firstName }"
                placeholder="First name"
              />
              <p v-if="formState.errors.firstName" class="mt-1 text-sm text-red-600">{{ formState.errors.firstName }}</p>
            </div>

            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                id="lastName"
                type="text"
                v-model="formState.lastName"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                :class="{ 'border-red-300 bg-red-50': formState.errors.lastName }"
                placeholder="Last name"
              />
              <p v-if="formState.errors.lastName" class="mt-1 text-sm text-red-600">{{ formState.errors.lastName }}</p>
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              v-model="formState.password"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              :class="{ 'border-red-300 bg-red-50': formState.errors.password }"
              placeholder="Create a password"
            />
            <p v-if="formState.errors.password" class="mt-1 text-sm text-red-600">{{ formState.errors.password }}</p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label for="password2" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              id="password2"
              type="password"
              v-model="formState.password2"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              :class="{ 'border-red-300 bg-red-50': formState.errors.password2 }"
              placeholder="Confirm your password"
            />
            <p v-if="formState.errors.password2" class="mt-1 text-sm text-red-600">{{ formState.errors.password2 }}</p>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="formState.isSubmitting"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
              :class="{ 'opacity-70 cursor-not-allowed': formState.isSubmitting }"
            >
              <span v-if="formState.isSubmitting">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
              <span v-else>Create Account</span>
            </button>
          </div>
        </form>

        <p class="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <RouterLink to="/" class="font-medium text-blue-600 hover:text-blue-500">Log in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>