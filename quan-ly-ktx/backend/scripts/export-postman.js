// Tạo Postman collection từ Swagger của backend đang chạy.
// Chạy: npm run postman:export (cần backend đang chạy; API_URL mặc định http://localhost:5001)
const fs = require('node:fs');
const path = require('node:path');

const apiUrl = (process.env.API_URL || 'http://localhost:5001').replace(/\/$/, '');
const output = path.resolve(__dirname, '../../../docs/postman/ktx-care.postman_collection.json');

function toRequest(method, route, operation) {
  const isPublic = operation.security?.length === 0;
  const segments = route.split('/').filter(Boolean).map((part) => part.replace(/^\{(.+)\}$/, ':$1'));
  const variables = segments.filter((part) => part.startsWith(':')).map((part) => ({ key: part.slice(1), value: '' }));
  const query = (operation.parameters || [])
    .filter((parameter) => parameter.in === 'query')
    .map((parameter) => ({ key: parameter.name, value: '', disabled: true }));
  const request = {
    method: method.toUpperCase(),
    description: operation.description,
    header: [],
    url: {
      raw: `{{baseUrl}}/${segments.join('/')}`,
      host: ['{{baseUrl}}'],
      path: segments,
      ...(variables.length ? { variable: variables } : {}),
      ...(query.length ? { query } : {}),
    },
  };
  if (isPublic) request.auth = { type: 'noauth' };

  const example = operation.requestBody?.content?.['application/json']?.example;
  if (example) {
    request.header.push({ key: 'Content-Type', value: 'application/json' });
    request.body = { mode: 'raw', raw: JSON.stringify(example, null, 2), options: { raw: { language: 'json' } } };
  }
  return request;
}

const saveToken = [
  "pm.test('Đăng nhập thành công', () => pm.response.to.have.status(200));",
  "pm.collectionVariables.set('token', pm.response.json().access_token);",
];

async function main() {
  const response = await fetch(`${apiUrl}/api-docs-json`);
  if (!response.ok) throw new Error(`Không đọc được ${apiUrl}/api-docs-json (HTTP ${response.status}).`);
  const document = await response.json();

  const folders = new Map();
  for (const [route, item] of Object.entries(document.paths)) {
    for (const [method, operation] of Object.entries(item)) {
      const folder = operation.tags?.[0] || 'app';
      if (!folders.has(folder)) folders.set(folder, []);
      const entry = { name: operation.summary || `${method.toUpperCase()} ${route}`, request: toRequest(method, route, operation) };
      if (route === '/auth/login') {
        entry.request.body.raw = JSON.stringify({ username: '{{username}}', password: '{{password}}' }, null, 2);
        entry.event = [{ listen: 'test', script: { type: 'text/javascript', exec: saveToken } }];
      }
      folders.get(folder).push(entry);
    }
  }

  const collection = {
    info: {
      name: 'KTX Care API',
      description: 'Chạy Đăng nhập trước, token được lưu vào biến token. Điền username, password ở biến của collection.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{token}}', type: 'string' }] },
    variable: [
      { key: 'baseUrl', value: 'http://localhost:5001' },
      { key: 'username', value: 'demo_admin' },
      { key: 'password', value: '' },
      { key: 'token', value: '' },
    ],
    item: [...folders].map(([name, item]) => ({ name, item })),
  };

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(collection, null, 2)}\n`);
  const count = collection.item.reduce((sum, folder) => sum + folder.item.length, 0);
  console.log(`Đã ghi ${count} request vào ${output}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
