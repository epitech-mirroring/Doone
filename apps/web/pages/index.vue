<script setup lang="ts">
import DooneLogo from '~/components/DooneLogo.vue';

const router = useRouter();
const userStore = useUserStore();

useSeoMeta({
  title: "Doone",
  description: "You can finally move your project from in progress to Doone",
});

onMounted(() => {
  if (userStore.getMe === null && userStore.isLoggedIn) { // WARNING: This will probably break the dashboard showing no organization
    userStore.updateMe();
  }
});
</script>

<template>
  <div class="landing">
    <nav>
      <div id="left">
        <DooneLogo />
      </div>
      <div id="right">
        <div v-if="!userStore.isLoggedIn" id="auth">
          <div id="login" class="button" @click="router.push('/login')">
            Login
          </div>
          <div id="signup" class="button" @click="router.push('/signup')">
            Sign up
          </div>
        </div>
        <div v-else id="auth" class="space-x-2">
          <Button variant="link" @click="router.push('/dashboard')">
            <Avatar class="h-8 w-8">
              <AvatarImage :src="'https://api.dicebear.com/9.x/notionists/svg?scale=150&translateY=10&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&seed=' + userStore.getMe?.id" />
              <AvatarFallback :delay-ms="1000">
                {{ userStore.getMe?.name[0] }}
                {{ userStore.getMe?.name[1] }}
              </AvatarFallback>
            </Avatar>
          </Button>
          <Button variant="ghost" @click="userStore.logout()">
            <i class="fas fa-sign-out-alt"/>
          </Button>
        </div>
      </div>
    </nav>
    <main>
      <div id="text">
        <div id="title">
          <span>
            You can finally move your project <br >
            from
            <span id="wip"
              >in progress<svg
                id="wave"
                xmlns="http://www.w3.org/2000/svg"
                width="202"
                height="8"
                viewBox="0 0 202 8"
                fill="none"
              >
                <path
                  d="M1 4.76327L9.26352 3.30619C10.4123 3.10363 11.5877 3.10363 12.7365 3.30619L19.2635 4.45708C20.4123 4.65964 21.5877 4.65964 22.7365 4.45708L29.2635 3.30619C30.4123 3.10363 31.5877 3.10363 32.7365 3.30619L39.2635 4.45708C40.4123 4.65964 41.5877 4.65964 42.7365 4.45708L49.2635 3.30619C50.4123 3.10363 51.5877 3.10363 52.7365 3.30619L59.2635 4.45708C60.4123 4.65964 61.5877 4.65964 62.7365 4.45708L69.2635 3.30619C70.4123 3.10363 71.5877 3.10363 72.7365 3.30619L79.2635 4.45708C80.4123 4.65964 81.5877 4.65964 82.7365 4.45708L89.2635 3.30619C90.4123 3.10363 91.5877 3.10363 92.7365 3.30619L99.2635 4.45708C100.412 4.65964 101.588 4.65964 102.736 4.45708L109.264 3.30619C110.412 3.10363 111.588 3.10363 112.736 3.30619L119.264 4.45708C120.412 4.65964 121.588 4.65964 122.736 4.45708L129.264 3.30619C130.412 3.10363 131.588 3.10363 132.736 3.30619L139.264 4.45708C140.412 4.65964 141.588 4.65964 142.736 4.45708L149.264 3.30619C150.412 3.10363 151.588 3.10363 152.736 3.30619L159.264 4.45708C160.412 4.65964 161.588 4.65964 162.736 4.45708L169.264 3.30619C170.412 3.10363 171.588 3.10363 172.736 3.30619L179.264 4.45708C180.412 4.65964 181.588 4.65964 182.736 4.45708L189.264 3.30619C190.412 3.10363 191.588 3.10363 192.736 3.30619L201 4.76327"
                  class="stroke-primary"
                  stroke-width="5"
                /></svg
            ></span>
            to
            <DooneLogo size="text-5xl" disable-link />
          </span>
        </div>
        <div id="infos">
          <div class="info">
            <div class="info-icon">
              <i class="fas fa-handshake-angle"/>
            </div>
            <div class="info-text">
              <h3>Collaborate</h3>
              <p>
                Made for the ground-up to support agile teams and their
                collaboration needs.
              </p>
            </div>
          </div>
          <div class="info">
            <div class="info-icon">
              <i class="fas fa-rabbit-running"/>
            </div>
            <div class="info-text">
              <h3>Faster</h3>
              <p>
                Reduce task switching time, and make your team faster thanks to
                automation
              </p>
            </div>
          </div>
          <div class="info">
            <div class="info-icon">
              <i class="fas fa-timeline-arrow"/>
            </div>
            <div class="info-text">
              <h3>Easier</h3>
              <p>
                No more hours reading documentation, open and close tasks right
                up
              </p>
            </div>
          </div>
        </div>
      </div>

      <div id="logo">
        <div id="green-square"/>
        <svg
          id="purple-card"
          xmlns="http://www.w3.org/2000/svg"
          width="318"
          height="228"
          viewBox="0 0 318 228"
          fill="none"
        >
          <path
            d="M1.71453 60.5554C1.97092 25.2863 32.447 -2.15485 67.5498 1.27625L263.114 20.3916C293.725 23.3836 317.116 49.0378 317.276 79.794L317.689 158.827C317.861 191.836 291.337 218.784 258.329 219.136L61.6241 221.235C28.0679 221.592 0.741851 194.359 0.985794 160.802L1.71453 60.5554Z"
            class="fill-primary"
          />
        </svg>
        <svg
          id="checkered-card"
          xmlns="http://www.w3.org/2000/svg"
          width="317"
          height="163"
          viewBox="0 0 317 163"
          fill="none"
        >
          <path
            d="M25.3032 52.4202L150.852 33.2759L164.419 122.247L38.87 141.392L25.3032 52.4202Z"
            class="fill-white"
          />
          <path
            d="M85.9334 162.601C85.9334 162.487 84.5845 162.287 82.9264 162.202C77.6712 161.889 70.7298 160.436 64.0975 158.271C28.969 146.764 3.73261 115.119 0.163553 78.034C-0.904355 66.7547 3.31107 53.1966 11.2361 42.5724C13.4281 39.6101 19.0768 33.885 21.9995 31.6918C27.5638 27.4763 35.1235 23.8304 41.7558 22.1214C46.0274 21.0391 46.9829 20.8966 57.128 19.8712C61.9336 19.387 67.7509 18.8174 70.0553 18.5895C76.0693 17.9913 84.6407 17.1368 93.0996 16.3108C97.1183 15.9121 102.936 15.3424 106.027 15.0291C109.118 14.7158 116.256 14.0322 121.905 13.4625C127.554 12.9213 132.697 12.4086 133.343 12.3232C134.017 12.2662 141.099 11.5541 149.08 10.7566C157.09 9.98755 166.87 9.01912 170.804 8.62036C174.738 8.22159 181.258 7.56648 185.277 7.19619C189.296 6.79743 193.792 6.3417 195.253 6.19928C196.715 6.05686 201.155 5.62961 205.089 5.23084C218.916 3.86365 227.263 3.03764 241.483 1.58499C261.548 -0.408836 265.314 -0.465806 273.211 1.10077C284.761 3.4364 296.733 10.6427 304.264 19.7858C309.913 26.5933 313.96 34.5116 315.927 42.6294L316.658 45.5916V64.7608C316.658 76.5814 316.545 84.4143 316.377 85.1548C316.208 85.8384 315.758 87.9177 315.365 89.7976C314.943 91.6775 313.988 95.1525 313.257 97.545C302.662 130.813 274.756 155.395 240.696 161.461C238.953 161.775 236.255 162.088 234.654 162.202C233.08 162.287 231.703 162.487 231.619 162.629C231.422 162.943 85.9334 162.943 85.9334 162.601ZM105.493 99.5674C140.031 64.5045 137.53 67.3813 137.474 63.1658C137.446 59.8047 135.956 57.2128 133.118 55.6177C131.741 54.8487 131.376 54.7632 128.931 54.7632C126.683 54.7632 126.064 54.8772 124.996 55.4468C124.125 55.9025 116.032 63.9063 99.0012 81.1387L74.2707 106.175L63.3387 95.0955C55.8634 87.5189 51.929 83.7307 50.9735 83.1895C49.7089 82.4774 49.2592 82.392 47.011 82.392C44.819 82.392 44.285 82.5059 43.0485 83.161C40.0696 84.7561 38.3834 87.5759 38.3834 90.9939C38.3834 94.8107 37.737 94.0416 56.9313 113.524C66.3738 123.123 74.2145 130.956 74.3269 130.956C74.4675 130.956 88.4908 116.828 105.493 99.5674Z"
            class="fill-black"
          />
        </svg>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.landing {
  @apply h-screen flex flex-col;

  nav {
    @apply flex justify-between items-center;
    @apply px-4 py-2;
    @apply h-16;

    #right {
      @apply flex items-center;

      #auth {
        @apply flex items-center space-x-5;
        @apply px-7 py-[10px];

        .button {
          @apply cursor-pointer;
          @apply font-climate-crisis text-lg;

          &#login {
            @apply text-black;
          }

          &#signup {
            @apply px-3 py-2 rounded-md;
            @apply bg-primary text-primary-foreground;
          }

          &:hover {
            @apply transform scale-105;
            @apply transition-transform duration-200;
          }
        }
      }
    }
  }

  main {
    @apply flex justify-start items-end;
    @apply h-screen;
    @apply py-20 px-10;

    #text {
      @apply w-4/5 h-full;
      @apply flex flex-col items-start justify-center;

      #title {
        @apply h-full flex flex-col justify-center items-center;

        span {
          @apply text-6xl;
          @apply tracking-[-0.12rem];
        }

        #wip {
          @apply pointer-events-auto;
          position: relative;

          #wave {
            @apply absolute pointer-events-none;
            @apply left-0 top-1/2;
            @apply transform -translate-y-1/3;
            @apply w-full h-full;
            @apply transition-all duration-500;
          }

          &:hover #wave {
            @apply scale-x-0 -translate-x-1/2;
          }
        }
      }

      #infos {
        @apply flex justify-between w-full;

        .info {
          @apply inline-flex items-start space-x-4;
          @apply min-w-[300px];

          .info-icon {
            @apply rounded-full border-2 border-gray-200;
            @apply w-fit aspect-square;
            @apply p-3;
            @apply flex items-center justify-center;

            i {
              @apply text-2xl text-primary;
            }
          }

          .info-text {
            @apply w-[300px];
            @apply flex flex-col space-y-2;
            @apply py-3;

            h3 {
              @apply font-climate-crisis text-xl tracking-wide w-fit;
            }

            p {
              @apply text-[1rem];
              @apply whitespace-normal;
              @apply break-words;
            }
          }
        }
      }
    }

    #logo {
      @apply absolute;
      @apply top-1/2 right-1/3;
      @apply sm:hidden md:hidden lg:flex;
      @apply transform translate-x-full -translate-y-1/2;
      width: 317px;
      height: 315px;

      & > * {
        @apply absolute;
        @apply bottom-0 right-0;
        @apply transition-transform duration-200;
      }

      #green-square {
        width: 315.5px;
        height: 314px;
        flex-shrink: 0;
        border-radius: 92px;
        @apply bg-secondary;
      }

      #purple-card {
        @apply bottom-7;
        transform: rotate(0.765deg);
      }

      &:hover {
        #purple-card {
          @apply transform -rotate-12 -translate-x-6 -translate-y-8 scale-y-110;
        }

        #green-square {
          @apply transform rotate-12 translate-x-10 -translate-y-14 scale-y-110;
        }
      }
    }
  }
}
</style>
