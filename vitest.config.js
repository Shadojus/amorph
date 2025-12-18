import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom for DOM testing
    environment: 'jsdom',
    
    // Test files pattern
    include: ['tests/**/*.test.js', 'tests/**/*.spec.js'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['core/**/*.js', 'morphs/**/*.js', 'util/**/*.js'],
      exclude: ['**/node_modules/**', '**/tests/**']
    },
    
    // Global setup
    globals: true,
    
    // Timeout for async tests
    testTimeout: 10000,
    
    // Watch mode
    watch: false
  }
});
