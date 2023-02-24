<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <SearchBar />
    <div class="custom-container">
      <slot></slot>
    </div>
  </div>
</template>
