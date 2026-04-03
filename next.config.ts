/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tvoje stávající nastavení (pokud jsi tam nějaké měl, nech ho tu)
  
  // Přidání bezpečnostních hlaviček (Security Headers)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Zakazuje vložení tvého webu do iFramu na cizím webu
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Zabraňuje prohlížečům "hádat" typ souborů
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Chrání soukromí uživatelů při klikání na odkazy
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains', // Vynucuje HTTPS na celý rok
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // Starší, ale stále užitečná ochrana proti Cross-Site Scriptingu
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;