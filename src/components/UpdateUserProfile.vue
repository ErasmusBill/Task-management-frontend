<template>
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Update Profile</h1>
          <p class="mt-2 text-sm text-gray-600">Manage your personal information and account details</p>
        </div>
  
        <!-- Profile Form Card -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <!-- Alert Message -->
          <div
            v-if="message"
            :class="[
              isError ? 'bg-red-50 border-red-400 text-red-700' : 'bg-green-50 border-green-400 text-green-700',
              'p-4 border-l-4 flex items-center mb-4'
            ]"
          >
            <div :class="[isError ? 'text-red-400' : 'text-green-400', 'flex-shrink-0 mr-3']">
              <i :class="[isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle', 'text-xl']"></i>
            </div>
            <div>
              <p class="font-medium">{{ message }}</p>
            </div>
            <button @click="message = ''" class="ml-auto">
              <i class="fas fa-times"></i>
            </button>
          </div>
  
          <form @submit.prevent="updateProfile" class="p-6 space-y-6">
            <!-- Profile Picture (Optional) -->
            <div class="flex flex-col sm:flex-row items-center mb-6">
              <div
                class="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden mb-4 sm:mb-0 sm:mr-6"
              >
                <span v-if="!profilePicture" class="text-4xl text-gray-600">
                  {{ profileInitials }}
                </span>
                <img
                  v-else
                  :src="profilePicture"
                  alt="Profile picture"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex flex-col sm:flex-row">
                <button
                  type="button"
                  class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 sm:mb-0 sm:mr-2"
                >
                  <i class="fas fa-camera mr-2"></i> Change Photo
                </button>
                <button
                  type="button"
                  class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <i class="fas fa-trash-alt mr-2"></i> Remove
                </button>
              </div>
            </div>
  
            <!-- Personal Information Section -->
            <div>
              <h2 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Personal Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="first_name" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    v-model="profileData.first_name"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your first name"
                  />
                  <p v-if="errors.first_name" class="mt-1 text-sm text-red-600">{{ errors.first_name }}</p>
                </div>
  
                <div>
                  <label for="last_name" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    v-model="profileData.last_name"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your last name"
                  />
                  <p v-if="errors.last_name" class="mt-1 text-sm text-red-600">{{ errors.last_name }}</p>
                </div>
              </div>
            </div>
  
            <!-- Account Information Section -->
            <div>
              <h2 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Account Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    id="username"
                    v-model="profileData.username"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your username"
                  />
                  <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
                </div>
  
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    v-model="profileData.email"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email address"
                  />
                  <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
                </div>
              </div>
  
              <div class="mt-6">
                <div class="flex items-center">
                  <input
                    id="change_password"
                    type="checkbox"
                    v-model="showPasswordFields"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="change_password" class="ml-2 block text-sm text-gray-700">Change Password</label>
                </div>
  
                <div v-if="showPasswordFields" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      id="password"
                      v-model="profileData.password"
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password"
                    />
                    <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
                  </div>
  
                  <div>
                    <label for="password2" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      id="password2"
                      v-model="profileData.password2"
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                    <p v-if="errors.password2" class="mt-1 text-sm text-red-600">{{ errors.password2 }}</p>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Additional Information (Optional) -->
            <div>
              <h2 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Additional Information</h2>
              <div>
                <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  id="bio"
                  v-model="profileData.bio"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us a bit about yourself"
                ></textarea>
              </div>
            </div>
  
            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                @click="resetForm"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                :disabled="isLoading"
              >
                <i v-if="isLoading" class="fas fa-spinner fa-spin mr-2"></i>
                {{ isLoading ? 'Saving Changes...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  // State
  const userId = ref(localStorage.getItem('user_id'));
  const profileData = ref({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    password: '',
    password2: ''
  });
  const originalData = ref({});
  const isLoading = ref(false);
  const message = ref('');
  const isError = ref(false);
  const errors = ref({});
  const showPasswordFields = ref(false);
  const profilePicture = ref(null);
  
  // Computed property for profile initials
  const profileInitials = computed(() => {
    if (profileData.value.first_name && profileData.value.last_name) {
      return profileData.value.first_name.charAt(0) + profileData.value.last_name.charAt(0);
    }
    if (profileData.value.username) {
      return profileData.value.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  });
  
  // Fetch user profile data
  const fetchProfileData = async () => {
    isLoading.value = true;
    try {
      // Ensure userId is defined
      if (!userId.value) {
        throw new Error('User ID is undefined. Please log in again.');
      }
  
      const response = await axios.get(`http://127.0.0.1:8000/api/update-profile/${userId.value}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
  
      profileData.value = {
        username: response.data.username || '',
        email: response.data.email || '',
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        bio: response.data.bio || '',
        password: '',
        password2: ''
      };
      originalData.value = { ...profileData.value };
    } catch (error) {
      console.error('Error fetching profile data:', error);
      message.value = 'Failed to load profile data. Please try again.';
      isError.value = true;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Update user profile
  const updateProfile = async () => {
    isLoading.value = true;
    errors.value = {};
    message.value = '';
  
    try {
      const dataToSend = { ...profileData.value };
      if (!showPasswordFields.value) {
        delete dataToSend.password;
        delete dataToSend.password2;
      }
  
      const response = await axios.put(
        `http://127.0.0.1:8000/api/update-profile/${userId.value}/`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
  
      originalData.value = { ...profileData.value };
      originalData.value.password = '';
      originalData.value.password2 = '';
  
      profileData.value.password = '';
      profileData.value.password2 = '';
      showPasswordFields.value = false;
  
      if (response.data.username !== localStorage.getItem('username')) {
        localStorage.setItem('username', response.data.username);
      }
  
      message.value = 'Profile updated successfully!';
      isError.value = false;
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data) {
        errors.value = error.response.data;
        message.value = 'Please correct the errors below.';
      } else {
        message.value = 'Failed to update profile. Please try again.';
      }
      isError.value = true;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Reset form to original values
  const resetForm = () => {
    profileData.value = { ...originalData.value };
    errors.value = {};
    message.value = '';
    showPasswordFields.value = false;
  };
  
  // Load profile data on component mount
  onMounted(() => {
    if (!userId.value) {
      message.value = 'User ID not found. Please log in again.';
      isError.value = true;
      router.push('/login'); // Redirect to login if userId is missing
    } else {
      fetchProfileData();
    }
  });
  </script>