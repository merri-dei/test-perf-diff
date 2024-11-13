/** @type {import('next').NextConfig} */
const nextConfig = {
   experimental: {
        outputFileTracingIncludes: {
            '/api/test-results': ['./public/**/*']
        }
   }
}

module.exports = nextConfig
