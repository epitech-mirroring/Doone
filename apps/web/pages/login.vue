<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import DooneLogo from '~/components/DooneLogo.vue';
import { Checkbox } from '~/components/ui/checkbox';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  remember: z.boolean().optional(),
});

const router = useRouter();
const user = useUserStore();

const onSubmit = async (values: Record<string, string | boolean>): Promise<boolean> => {
  const email: string = values.email as string;
  const password: string = values.password as string;
  return await user.login(email, password).then(() => {
    router.push('/dashboard');
    user.setRememberMe((values.remember as boolean) || false);
    return true;
  }).catch(() => {
    return false;
  });
};

useSeoMeta({
  title: 'Doone | Login',
  description: 'Login to your account',
});

onMounted(() => {
  if (user.isLoggedIn) {
    router.push('/dashboard');
  }
});
</script>

<template>
  <Form
    v-slot="{ meta, values, validate, errors, setErrors }"
    as=""
    keep-values
    :validation-schema="toTypedSchema(formSchema)"
  >
    <main>
      <div id="left">
        <div id="head">
          <DooneLogo size="lg" with-logo />
          <h1 class="text-3xl font-semibold text-black">Welcome back!</h1>
          <p class="text-gray-500">Enter your email and password to continue</p>
        </div>
        <form
          id="form"
          @submit="
            async (e) => {
              e.preventDefault();
              await validate();

              if (meta.valid) {
                if (await onSubmit(values)) {
                  return;
                } else {
                  setErrors({ password: 'Invalid email or password' });
                }
              }
            }
          "
        >
          <FormField v-slot="{ componentField }" name="email">
            <FormItem class="w-full">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="email"
                  placeholder="e.g. john.doe@wanadoo.fr"
                />
              </FormControl>
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="password">
            <FormItem class="w-full">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input v-bind="componentField" type="password" />
              </FormControl>
              <FormMessage v-if="errors.password" class="text-red-500">
                {{ errors.password }}
              </FormMessage>
            </FormItem>
          </FormField>
          <div class="w-full flex justify-between items-center gap-3 -mt-4">
            <FormField v-slot="{ componentField }" name="remember">
              <FormItem class="flex items-center justify-start gap-3">
                <FormControl>
                  <Checkbox v-bind="componentField" id="remember" />
                  <span
                    class="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    style="margin: 0"
                  >
                    Remember me
                  </span>
                </FormControl>
              </FormItem>
            </FormField>
            <Button
              type="button"
              variant="link"
              class="text-sm"
              @click="router.push('/forgot-password')"
            >
              Forgot password?
            </Button>
          </div>
          <Button
            type="submit"
            class="w-full font-climate-crisis text-lg tracking-wide"
            variant="alt"
          >
            Login
          </Button>
        </form>
        <Separator label="Or login with" class="my-7" />
        <div id="oauth" class="flex justify-center w-full gap-3">
          <Button variant="outline">
            <span class="flex items-center justify-center gap-2 px-3 py-2">
              <img
                src="~/assets/images/oauth/google.svg"
                alt="Google"
                class="w-5 h-5"
              >
              <span>Google</span>
            </span>
          </Button>
          <Button variant="outline">
            <span class="flex items-center justify-center gap-2 px-3 py-2">
              <img
                src="~/assets/images/oauth/apple.svg"
                alt="Google"
                class="w-5 h-5"
              >
              <span>Apple</span>
            </span>
          </Button>
          <Button variant="outline">
            <span class="flex items-center justify-center gap-2 px-3 py-2">
              <img
                src="~/assets/images/oauth/github.svg"
                alt="Google"
                class="w-5 h-5"
              >
              <span>GitHub</span>
            </span>
          </Button>
        </div>
        <div id="footer">
          <span>© 2024 Doone. All rights reserved.</span>
          <div class="flex gap-1 items-end">
            <Button
              variant="link"
              class="m-0 p-0 h-fit"
              @click="router.push('/privacy')"
            >
              Privacy Policy
            </Button>
            <div class="w-1 h-1 bg-gray-200 rounded-full my-auto"/>
            <Button
              variant="link"
              class="m-0 p-0 h-fit"
              @click="router.push('/terms')"
            >
              Terms of Service
            </Button>
          </div>
        </div>
      </div>
      <div id="right"/>
    </main>
  </Form>
</template>

<style scoped lang="scss">
main {
  @apply w-screen h-screen flex flex-row justify-start items-center;
  @apply p-3;

  #left {
    @apply w-1/2 h-full flex flex-col justify-start;
    @apply rounded-lg border border-gray-100;
    @apply bg-gray-50;
    @apply px-3 py-5 pt-20;

    #head {
      @apply flex flex-col justify-center items-center px-10;
      @apply space-y-3;
    }
    #form {
      @apply w-full h-full pt-20 px-5;
      @apply flex flex-col gap-5 items-center;
    }
    #footer {
      @apply flex justify-between items-end h-full;
      @apply text-sm text-gray-500;
    }
  }

  #right {
    @apply w-full h-full;
    @apply flex flex-col justify-center items-center gap-8;
    @apply bg-white;

    #head {
      @apply flex flex-col justify-center items-center gap-3;
      @apply w-full h-fit;
      @apply px-3 py-5;
    }
  }
}
</style>
