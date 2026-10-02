const { spawn } = require('child_process');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const domain = 'pujoatlas-kolkata.surge.sh';

console.log('Deploying', distDir, 'to', domain);

const proc = spawn('npx', ['surge', './dist', domain], {
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe']
});

proc.stdout.on('data', (d) => {
  const text = d.toString();
  console.log('[stdout]', text);
  if (text.includes('email:')) {
    proc.stdin.write('pujoatlas_dev_2026@gmail.com\n');
  } else if (text.includes('password:')) {
    proc.stdin.write('PujoAtlas#2026Pass!\n');
  }
});

proc.stderr.on('data', (d) => {
  console.log('[stderr]', d.toString());
});

proc.on('close', (code) => {
  console.log('Surge process exited with code', code);
});
