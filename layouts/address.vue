<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <SearchBar class="pb-0" />
    <AddressPrimaryName />
    <div class="custom-container">
      <slot></slot>
    </div>
  </div>
</template>
