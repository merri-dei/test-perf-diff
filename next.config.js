/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        outputFileTracingIncludes: {
            '/app/api/test-results/route': ['./public/**/*']
        }
    }
}

module.exports = nextConfig
