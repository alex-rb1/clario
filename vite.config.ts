import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'rich-text',
              test: /node_modules\/(?:@tiptap|prosemirror)/,
            },
            { name: 'syntax', test: /node_modules\/(?:lowlight|highlight.js)/ },
            { name: 'flow', test: /node_modules\/@xyflow/ },
          ],
        },
      },
    },
  },
})
