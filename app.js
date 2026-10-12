// app.js
// Точка входа. Вся логика — в ./app/*.

import { init } from './app/main.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}