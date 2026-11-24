import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate==0'],
    checks: ['rate==1'],
  },
};

export default function () {
  const response = http.get(
    'http://localhost:3000/api/tracking/ATP-7K3M-9QX2'
  );

  check(response, {
    'Seguimiento HTTP 200': (r) => r.status === 200,
  });

  sleep(1);
}
