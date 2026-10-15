import {copyFile,mkdir} from 'node:fs/promises';
await mkdir(new URL('../ui/vendor/',import.meta.url),{recursive:true});
await copyFile(new URL('../node_modules/ical.js/dist/ical.js',import.meta.url),new URL('../ui/vendor/ical.js',import.meta.url));
await copyFile(new URL('../node_modules/ical.js/LICENSE',import.meta.url),new URL('../ui/vendor/ICAL-LICENSE',import.meta.url));
