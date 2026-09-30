<script lang="ts" setup>
import { Label } from "reka-ui";
import { configure, useForm } from "vee-validate";

import { loginSchema } from "~/types/login.types";

const { signIn } = useAuth();
const router = useRouter();
const submitError = ref("");

const { handleSubmit, defineField, errors, isSubmitting } = useForm({ validationSchema: loginSchema, initialValues: { email: "", password: "" } });
const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");

// Turn off VeeValidate's automatic validation triggers globally.
// Goal: no errors while the user is still typing on a fresh form.
// Validation only runs when they click Sign In, because handleSubmit
// always validates, regardless of these flags.
configure({
  validateOnBlur: false,
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false,
});

const onSubmit = handleSubmit(async (values) => {
  submitError.value = "";
  try {
    await signIn(values.email, values.password);
    router.push("/");
  }
  catch {
    submitError.value = "Incorrect email or password.";
  }
});
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-bg-main px-6">
    <div class="w-full max-w-sm">
      <div class="flex justify-center mb-6">
        <NuxtImg src="/job-log-logo.svg" alt="Job Log Logo" width="56" height="56" />
      </div>

      <h1 class="text-title font-bold text-center text-text-main mb-1">
        Welcome Back!
      </h1>
      <p class="text-center text-text-main mb-8">
        Access your job log workspace.
      </p>

      <!-- novalidate disables the browser's native validation so VeeValidate/Zod handles it instead -->
      <form class="space-y-5" novalidate @submit="onSubmit">
        <div>
          <Label for="email" class="field-label">Email</Label>
          <input
            id="email" v-model="email" v-bind="emailAttrs" type="email"
            placeholder="Enter your Email"
            class="field-input" :aria-invalid="!!errors.email"
          >
          <p v-if="errors.email" class="field-error">
            {{ errors.email }}
          </p>
        </div>

        <div>
          <Label for="password" class="field-label">Password</Label>
          <input
            id="password" v-model="password" v-bind="passwordAttrs" type="password"
            placeholder="Enter your Password"
            class="field-input" :aria-invalid="!!errors.password"
          >
          <p v-if="errors.password" class="field-error">
            {{ errors.password }}
          </p>
        </div>

        <p v-if="submitError" class="text-sm text-red-700">
          {{ submitError }}
        </p>

        <button
          type="submit" :disabled="isSubmitting"
          class="w-full mt-5 rounded-sm bg-btn-bg cursor-pointer text-text-inverse text-sm font-medium uppercase tracking-wider py-3.5 disabled:opacity-60"
        >
          {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="text-center text-xs text-text-main/70 mt-6 leading-relaxed">
        Private instance. Unauthorized access is restricted.
      </p>
    </div>
  </main>
</template>
