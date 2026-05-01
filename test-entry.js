// Simulate what Gradle does
const { resolveEntryPoint } = require('@expo/config/paths');
const path = require('path');

const projectRoot = path.resolve('.');
console.log('projectRoot:', projectRoot);

try {
    const entry = resolveEntryPoint(projectRoot, 'android');
    console.log('Entry point:', entry);
} catch (e) {
    console.error('Error:', e.message);
}
