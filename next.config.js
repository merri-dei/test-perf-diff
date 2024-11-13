/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingIncludes: {
        '/api/*': ['./public/**/*']
    }
}

module.exports = nextConfig
