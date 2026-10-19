import { mount } from 'svelte';
import '@fontsource/victor-mono/latin-700.css';
import '@fontsource/victor-mono/latin-ext-700.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-ext-400.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '@fontsource/ibm-plex-sans/latin-ext-600.css';
// partner wordmarks (see src/event.js)
import '@fontsource/saira/latin-400.css';
import '@fontsource/unbounded/latin-800.css';
import Site from './Site.svelte';

mount(Site, { target: document.getElementById('app') });
