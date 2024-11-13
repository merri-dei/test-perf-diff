/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingIncludes: {
        '/api/test-results': ['./public/**/*']
    }
}

module.exports = nextConfig
