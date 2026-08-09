// Prints the address to open on a phone, plus a QR code to scan so nobody has
// to read an IP address off one screen and type it into another.
import os from 'node:os';
import qrcode from 'qrcode-terminal';

const PORT = Number(process.env.CLIENT_PORT) || 3000;

export function localAddress() {
  const candidates = [];

  for (const [name, addresses] of Object.entries(os.networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family !== 'IPv4' || address.internal) continue;
      // Link-local addresses mean "no network configured" and never work.
      if (address.address.startsWith('169.254.')) continue;
      candidates.push({ name, address: address.address });
    }
  }

  // Home networks live in these ranges; prefer them over VPN or docker
  // interfaces, which a phone cannot reach.
  const isPrivate = (ip) =>
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip);

  return (candidates.find((c) => isPrivate(c.address)) ?? candidates[0])?.address ?? null;
}

const address = localAddress();

console.log('');
if (!address) {
  console.log('  Could not find a network address — is this computer on Wi-Fi?');
  console.log('  The app will still work on this computer at http://localhost:' + PORT);
} else {
  const url = `http://${address}:${PORT}`;
  console.log('  On this computer:  http://localhost:' + PORT);
  console.log('  On your phone:     ' + url);
  console.log('');
  console.log('  Point your phone camera at this code to open it:');
  console.log('');
  qrcode.generate(url, { small: true });
  console.log('  Your phone must be on the same Wi-Fi as this computer.');
}
console.log('');
