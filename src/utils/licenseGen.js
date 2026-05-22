function randomChars(len, chars) {
  const c = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += c[Math.floor(Math.random() * c.length)];
  return out;
}

function generateLicenseKey() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const part1 = randomChars(5);
  const part2 = randomChars(2);
  return `ITBH-${part1}-${part2}-${dd}-${mm}-${yy}`;
}

module.exports = { generateLicenseKey };
