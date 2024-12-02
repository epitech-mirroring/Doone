<script setup lang="ts">
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import DooneLogo from "~/components/DooneLogo.vue";
import zxcvbn from "zxcvbn";
import { PinInput, PinInputGroup } from "~/components/ui/pin-input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";


const router = useRouter();
const user = useUserStore();

const steps: {
  step: number;
  title: string;
  longTitle: string;
  description: string;
  altDescription: string;
  icon: string;
  onSubmit?: (values: never) => void;
}[] = [
  {
    step: 1,
    title: 'Details',
    longTitle: 'Create a free account',
    description: 'Provide your email and password',
    altDescription: 'Fill in the fields and create your account',
    icon: 'fa-user',
    onSubmit: (values: { email: string; firstName: string; lastName: string; password: string }) => {
      console.log(values);
      user.register(values.email, values.password, values.firstName + " " + values.lastName.toUpperCase());
    },
  },
  {
    step: 2,
    title: 'Verify your mail',
    longTitle: 'Verify your email',
    description: 'Check your mails and enter your verification code',
    altDescription: 'Check your email and enter the verification code',
    icon: 'fa-envelope',
  },
  {
    step: 3,
    title: 'Create your organization',
    longTitle: 'Create or join an organization',
    description: 'Create or join an existing organization',
    altDescription: 'Enter your invitation code or create a new organization',
    icon: 'fa-buildings',
  },
  {
    step: 4,
    title: 'Invite your team',
    longTitle: 'Invite your team members',
    description: 'Invite your team members to join your organization',
    altDescription: 'Add your team members email addresses to invite them',
    icon: 'fa-people-group',
  },
  {
    step: 5,
    title: 'Welcome to Doone',
    longTitle: 'Welcome to Doone',
    description: 'Start managing your task right away',
    altDescription: 'Your project has never been so close to being done',
    icon: 'fa-rocket',
  },
];

const currentStep = ref(1);

const formSchema = [
  z
    .object({
      email: z.string().email(),
      firstName: z.string().min(2).max(50),
      lastName: z.string().min(2).max(50),
      password: z.string().min(2).max(50),
      confirmPassword: z.string(),
    })
    .refine(
      (values) => {
        return values.password === values.confirmPassword;
      },
      {
        message: 'Passwords must match!',
        path: ['confirmPassword'],
      },
    ),
  z.object({
    verificationCode: z
      .array(z.coerce.string())
      .length(8, { message: 'Invalid input' }),
  }),
  z
    .object({
      organizationLogo:
        typeof window === 'undefined' ? z.any() : z.instanceof(FileList),
      organizationName: z.string().min(2).max(20),
      organizationDescription: z.string().max(100).nullable(),
    })
    .or(
      z.object({
        inviteCode: z.string().min(6).max(6),
      }),
    ),
  z.object({
    inviteEmails: z.array(z.string().email()),
  }),
  z.object({}),
];

const onSubmit = (values: Record<string, unknown>) => {
  console.log(values);
  steps[currentStep.value - 2].onSubmit?.(values as never);
};

const getPasswordStrength = (
  password: string,
): { strength: number; color: string; label: string } => {
  const strength = zxcvbn(password).score;

  return {
    strength,
    color: ['#FF6B6B', '#FFB84D', '#FFD700', '#7CFC00', '#4CAF50'][strength],
    label: ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength],
  };
};

const getImageData = (e: Event) => {
  const dataTransfer = new DataTransfer();

  Array.from((e.target as HTMLInputElement).files).forEach((file) => {
    dataTransfer.items.add(file);
  });

  const files = dataTransfer.files;
  const displayUrl = URL.createObjectURL(files[0]);

  return { files, displayUrl };
};

const preview = ref<string | null>(null);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

useSeoMeta({
  title: 'Sign Up',
  description: 'Create a free account and start managing your tasks',
});

onMounted(() => {
  if (user.isLoggedIn) {
    router.push('/dashboard');
  }
});
</script>

<template>
  <Form
    v-slot="{ meta, values, validate, setFieldValue }"
    as=""
    keep-values
    :validation-schema="toTypedSchema(formSchema[currentStep - 1])"
  >
    <Stepper
      v-slot="{ nextStep }"
      v-model="currentStep"
      orientation="vertical"
    >
      <main>
        <div id="left">
          <div id="logo">
            <DooneLogo size="lg" with-logo />
          </div>
          <form
            id="stepper"
            @submit="
              (e) => {
                e.preventDefault();
                validate();

                if (meta.valid) {
                  onSubmit(values);
                }
              }
            "
          >
            <StepperItem
              v-for="step in steps"
              :key="step.step"
              v-slot="{ state }"
              class="relative flex w-full items-start gap-6"
              :step="step.step"
            >
              <StepperSeparator
                v-if="step.step !== steps[steps.length - 1].step"
                class="absolute left-[18px] top-[38px] block h-[150%] w-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
              />

              <StepperTrigger as-child>
                <Button
                  :variant="
                    state === 'completed' || state === 'active'
                      ? 'default'
                      : 'outline'
                  "
                  size="icon"
                  class="z-10 rounded-full shrink-0"
                  :class="[
                    state === 'active' &&
                      'ring-2 ring-ring ring-offset-2 ring-offset-background',
                  ]"
                  :disabled="state !== 'completed' && !meta.valid"
                >
                  <i
                    class="fas"
                    :class="[
                      state === 'completed' && 'text-primary-foreground',
                      state === 'active' && 'text-primary-foreground',
                      state === 'inactive' && 'text-muted-foreground',
                      step.icon,
                    ]"
                  />
                </Button>
              </StepperTrigger>

              <div class="flex flex-col gap-1">
                <StepperTitle
                  :class="[state === 'active' && 'text-primary']"
                  class="text-sm font-semibold transition lg:text-base"
                >
                  {{ step.title }}
                </StepperTitle>
                <StepperDescription
                  :class="[state === 'active' && 'text-primary']"
                  class="sr-only text-xs text-muted-foreground transition md:not-sr-only lg:text-sm"
                >
                  {{ step.description }}
                </StepperDescription>
              </div>
            </StepperItem>
          </form>
          <div id="footer">
            <Button variant="ghost" @click="router.back()">
              <i class="fas fa-arrow-left" />
              Go Back
            </Button>
            <Button variant="ghost" @click="router.push('/login')">
              Login
            </Button>
          </div>
        </div>
        <div id="right">
          <div id="head">
            <DooneLogo size="lg" no-text with-logo disable-link />
            <h1 id="step-title">
              {{ steps[currentStep - 1].longTitle }}
            </h1>
            <p id="step-description">
              {{ steps[currentStep - 1].altDescription }}
            </p>
          </div>
          <div id="form">
            <template v-if="currentStep === 1">
              <FormField v-slot="{ componentField }" name="email">
                <FormItem class="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      v-bind="componentField"
                      placeholder="e.g. john.doe@wanadoo.fr"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <div class="w-full flex flex-row gap-5">
                <FormField v-slot="{ componentField }" name="firstName">
                  <FormItem class="w-full">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" placeholder="e.g. John" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="lastName">
                  <FormItem class="w-full">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" placeholder="e.g. Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
              <FormField v-slot="{ componentField }" name="password">
                <FormItem class="w-full">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="password"
                      placeholder="***********"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField v-slot="{ componentField }" name="confirmPassword">
                <FormItem class="w-full">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="password"
                      placeholder="***********"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <div id="password-strength">
                <span>{{
                  getPasswordStrength(values.password || '').label
                }}</span>
                <div id="password-strength-bar">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="w-1/4 h-2 rounded-lg"
                    :style="{
                      backgroundColor:
                        i - 1 <=
                        getPasswordStrength(values.password || '').strength
                          ? getPasswordStrength(values.password || '').color
                          : 'rgb(229 231 235)',
                    }"
                  />
                </div>
              </div>
            </template>
            <template v-else-if="currentStep === 2">
              <FormField
                v-slot="{ componentField, value }"
                name="verificationCode"
              >
                <FormItem>
                  <FormControl>
                    <PinInput
                      id="pin-input"
                      :model-value="value"
                      class="flex gap-2 items-center mt-1 scale-125"
                      otp
                      type="number"
                      :name="componentField.name"
                      @update:model-value="
                        (arrStr) => {
                          setFieldValue(
                            'verificationCode',
                            arrStr.filter(Boolean),
                          );
                        }
                      "
                    >
                      <PinInputGroup>
                        <template v-for="(id, index) in 8" :key="id">
                          <PinInputInput
                            :index="index"
                            :class="[
                              index === 3 && 'rounded-r-lg mr-2',
                              index === 4 && 'rounded-l-lg ml-2 border-l',
                            ]"
                          />
                          <template v-if="index === 3">
                            <PinInputSeparator />
                          </template>
                        </template>
                      </PinInputGroup>
                    </PinInput>
                  </FormControl>
                  <FormDescription class="w-full transform -translate-x-10">
                    <span class="text-gray-400"
                      >You didn’t received the email?</span
                    >
                    <Button variant="link" size="default"> Resend code </Button>
                  </FormDescription>
                </FormItem>
              </FormField>
            </template>
            <template v-else-if="currentStep === 3">
              <div class="w-full flex flex-row gap-5 items-start justify-start">
                <Avatar
                  class="rounded-md bg-white border border-gray-200 w-14 h-14 mt-auto"
                >
                  <AvatarImage v-if="preview" :src="preview" />
                  <AvatarFallback v-else>{{
                    values.organizationName ? values.organizationName[0] : ''
                  }}</AvatarFallback>
                </Avatar>
                <FormField name="organizationLogo">
                  <FormItem class="w-1/2">
                    <FormLabel>Organization Logo</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        @change="
                          (event: Event) => {
                            const { files, displayUrl } = getImageData(
                              event,
                            );
                            setFieldValue('organizationLogo', files);
                            preview = displayUrl;
                          }
                        "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="organizationName">
                  <FormItem class="w-full">
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" placeholder="e.g. Doone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
              <FormField
                v-slot="{ componentField }"
                name="organizationDescription"
              >
                <FormItem class="w-full">
                  <FormLabel>Organization Description</FormLabel>
                  <FormControl>
                    <Textarea
                      v-bind="componentField"
                      placeholder="e.g. The best task management website"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <Separator label="Or join with" />
              <FormField v-slot="{ componentField, value }" name="inviteCode">
                <FormItem>
                  <FormLabel class="-translate-x-10">
                    Invitation Code
                  </FormLabel>
                  <FormControl>
                    <PinInput
                      id="pin-input"
                      :model-value="value"
                      class="flex gap-2 items-center mt-1"
                      :name="componentField.name"
                      placeholder="○"
                      @update:model-value="
                        (arrStr) => {
                          setFieldValue('inviteCode', arrStr.filter(Boolean));
                        }
                      "
                    >
                      <PinInputGroup>
                        <template v-for="(id, index) in 8" :key="id">
                          <PinInputInput :index="index" />
                        </template>
                      </PinInputGroup>
                    </PinInput>
                  </FormControl>
                </FormItem>
              </FormField>
            </template>
            <template v-else-if="currentStep === 4">
              <FormField v-slot="{ }" name="inviteEmails">
                <FormItem class="w-full">
                  <FormLabel>Invite your team members</FormLabel>
                  <FormControl>
                    <template
                      v-for="(id, index) in clamp(
                        (values.inviteEmails?.length || 0) + 1,
                        0,
                        7,
                      )"
                      :key="id"
                    >
                      <Input
                        type="email"
                        placeholder="e.g. samantha.doe@wanadoo.fr"
                        @change="
                          (event: Event) => {
                            if (!values.inviteEmails) {
                              setFieldValue('inviteEmails', [(event.target as HTMLInputElement).value]);
                            } else {
                              // if email is empty, remove it from the array
                              if (!(event.target as HTMLInputElement).value) {
                                setFieldValue(
                                  'inviteEmails',
                                  values.inviteEmails.filter(
                                    (email: string) =>
                                      email !== values.inviteEmails[index],
                                  ),
                                );
                              } else {
                                if (index === values.inviteEmails.length) {
                                  setFieldValue('inviteEmails', [
                                    ...values.inviteEmails,
                                    (event.target as HTMLInputElement).value,
                                  ]);
                                } else {
                                  setFieldValue('inviteEmails', [
                                    ...values.inviteEmails.slice(0, index),
                                    (event.target as HTMLInputElement).value,
                                    ...values.inviteEmails.slice(index + 1),
                                  ]);
                                }
                              }
                            }
                          }
                        "
                      />
                    </template>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </template>
            <Button
              :type="meta.valid ? 'button' : 'submit'"
              size="lg"
              class="font-climate-crisis text-lg tracking-wide w-full"
              @click="
                () => {
                  if (meta.valid) {
                    nextStep();
                    onSubmit(values);
                  }
                }
              "
            >
              {{ currentStep === steps.length ? 'Finish' : 'Continue' }}
            </Button>
          </div>
        </div>
      </main>
    </Stepper>
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
    @apply px-3 py-5;

    #logo {
      @apply flex justify-start items-center h-20 px-10;
    }

    #stepper {
      @apply px-3 py-12;
      @apply flex flex-col gap-16;
    }
    #footer {
      @apply flex justify-between items-end h-full;
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

      #step-title {
        @apply text-2xl font-semibold;
      }

      #step-description {
        @apply text-sm text-gray-500;
      }
    }

    #form {
      @apply w-full h-2/3;
      @apply flex flex-col gap-5 items-center;
      @apply px-[100px];

      #password-strength {
        @apply w-full;
        @apply flex flex-col gap-3;

        span {
          @apply text-sm;
        }

        #password-strength-bar {
          @apply flex flex-row gap-1;
        }
      }
    }
  }
}
</style>
