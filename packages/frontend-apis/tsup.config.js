import { defineConfig } from 'tsup'

const cfg = {
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: false,
    dts: true,
    format: ['esm', 'cjs'],
}

export default defineConfig([
    {
        ...cfg,
        entry: {
            index: 'src/index.ts',
        },
        outDir: 'dist',
    },
])
