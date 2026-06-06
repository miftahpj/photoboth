<template>
  <div class="min-h-screen flex flex-col relative">
    <div class="fixed top-0 left-0 right-0 h-4 z-50" style="background:repeating-linear-gradient(90deg,#C0392B 0,#C0392B 20px,#FFFFFF 20px,#FFFFFF 40px,#1A3A6B 40px,#1A3A6B 60px)"></div>
    <div class="fixed bottom-0 left-0 right-0 h-4 z-50" style="background:repeating-linear-gradient(90deg,#1A3A6B 0,#1A3A6B 20px,#FFFFFF 20px,#FFFFFF 40px,#C0392B 40px,#C0392B 60px)"></div>
    <div class="fixed top-0 left-0 bottom-0 w-4 z-50" style="background:repeating-linear-gradient(180deg,#C0392B 0,#C0392B 20px,#FFFFFF 20px,#FFFFFF 40px,#1A3A6B 40px,#1A3A6B 60px)"></div>
    <div class="fixed top-0 right-0 bottom-0 w-4 z-50" style="background:repeating-linear-gradient(180deg,#1A3A6B 0,#1A3A6B 20px,#FFFFFF 20px,#FFFFFF 40px,#C0392B 40px,#C0392B 60px)"></div>
    <main class="flex-1 mt-4 mb-4 ml-4 mr-4 overflow-y-auto bg-airmail-cream">
      <slot />
    </main>
  </div>
</template>
