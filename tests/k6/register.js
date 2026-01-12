import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 150 },
    { duration: '1m', target: 150 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const isValid = Math.random() < 0.8;

  let payload = {};

  if (isValid) {
    payload = {
      email: `user_${uuidv4()}@test.com`,
      password: 'StrongPass123',
    };
  } else {
    const invalids = [
      { email: '', password: '12345678' },
      { email: 'invalidemail', password: 'short' },
      { email: `no_pass_${uuidv4()}@test.com` },
    ];
    payload = invalids[Math.floor(Math.random() * invalids.length)];
  }

  const res = http.post(
    'http://localhost:3000/api/auth/register',
    JSON.stringify(payload),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  check(res, {
    'status is 201 or 400': (r) => [201, 400].includes(r.status),
    'duration < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
