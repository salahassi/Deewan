import {defineConfig} from 'vite';
import {writeFileSync} from 'node:fs';
import react from '@vitejs/plugin-react';
import {fileURLToPath,URL} from 'node:url';
export default defineConfig({
 plugins:[react(),{name:'no-jekyll',closeBundle(){writeFileSync(new URL('./docs/.nojekyll',import.meta.url),'');}}],base:'/Deewan/',
 resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},
 define:{__DIWAN_STATIC__:true},
 build:{outDir:'docs',emptyOutDir:true},
});
