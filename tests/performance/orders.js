import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate==0'],
  },
};

const BASE_URL = 'http://localhost:3000';

export function setup() {
  const response = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: __ENV.ADMIN_EMAIL,
      password: __ENV.ADMIN_PASSWORD,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (response.status !== 200) {
    throw new Error(`Falló autenticación: HTTP ${response.status}`);
  }

  return {
    cookie: response.cookies.atp_session[0].value,
  };
}

export default function (data) {
  const response = http.get(`${BASE_URL}/api/work-orders`, {
    headers: { Cookie: `atp_session=${data.cookie}` },
  });

  check(response, {
    'Órdenes: HTTP 200': (r) => r.status === 200,
  });

  sleep(1);
}
