import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// 🔧 Настройка лёгкой нагрузки
export const options = {
  stages: [
    { duration: '10s', target: 5 }, // разогрев
    { duration: '20s', target: 10 },
    { duration: '30s', target: 20 },
    { duration: '20s', target: 10 },
    { duration: '10s', target: 0 },
  ],
  rps: 50,
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const isValid = Math.random() < 0.8;

  let payload;

  if (isValid) {
    payload = {
      email: `lite_${uuidv4()}@test.com`,
      password: 'StrongPass123',
    };
  } else {
    const invalids = [
      { email: '', password: '12345678' },
      { email: 'invalidemail', password: 'short' },
      { email: `bad_${uuidv4()}@test.com` }, // без пароля
    ];
    payload = invalids[Math.floor(Math.random() * invalids.length)];
  }

  const url = 'http://127.0.0.1:3000/api/auth/register'; // IPv4 только!
  const headers = { 'Content-Type': 'application/json' };
  const res = http.post(url, JSON.stringify(payload), { headers });

  check(res, {
    'status is 201 or 400': (r) => [201, 400].includes(r.status),
    'duration < 1s': (r) => r.timings.duration < 1000,
  });

  if (![201, 400].includes(res.status)) {
    console.error(
      `❌ Unhandled status: ${res.status} — payload: ${JSON.stringify(payload)}`,
    );
  }

  sleep(1); // имитируем паузу между действиями пользователя
}
