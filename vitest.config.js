// vitest.config.js
import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    // Подключаем глобальные функции (describe, it и т. д.)
    globals: true,
    // Запуск в Node.js
    environment: 'node',
    // Файл(ы) инициализации перед всеми тестами
    setupFiles: ['./tests/setup.js'],

    // Где искать тесты
    include: ['tests/**/*.{js,ts}'],
    // Исключаем артефакты и ненужные папки из процесса тестирования
    exclude: ['tests/setup.js', 'tests/k6/**', ...configDefaults.exclude],

    coverage: {
      // Собираем покрытие нативным провайдером V8
      provider: 'v8',
      // На что навесить инструмент покрытия — ваши исходники
      include: [
        'middleware/**/*.js',
        'models/**/*.js',
        'routes/**/*.js',
        'validators/**/*.js',
        'server.js',
        'swagger.js',
      ],
      // Что не учитывать в отчёте покрытия
      exclude: ['tests/**', 'scripts/**', 'vitest.config.js'],
      // Форматы отчётов
      reporter: ['text', 'lcov', 'html'],
      // Папка с выходными файлами покрытия
      reportsDirectory: 'coverage',
    },
  },
});
