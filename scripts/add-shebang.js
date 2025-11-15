const fs = require('fs');
const path = require('path');

const cliPath = path.join(__dirname, '../dist/cli/index.js');

if (!fs.existsSync(cliPath)) {
  console.error('Error: dist/cli/index.js not found. Run build first.');
  process.exit(1);
}

const content = fs.readFileSync(cliPath, 'utf8');
const shebang = '#!/usr/bin/env node\n';

if (!content.startsWith('#!/')) {
  fs.writeFileSync(cliPath, shebang + content);
  console.log('✓ Added shebang to dist/cli/index.js');
} else {
  console.log('✓ Shebang already present');
}

