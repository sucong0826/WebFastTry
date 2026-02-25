/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/test/videosdkcompare",
        headers: [
          {
            key: "Document-Isolation-Policy",
            value: "isolate-and-credentialless",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

