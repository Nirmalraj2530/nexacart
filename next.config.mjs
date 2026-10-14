/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/product/:id',
        destination: '/products/:id',
        permanent: true,
      },
      {
        source: '/product',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/',
        permanent: false,
      },
      {
        source: '/users',
        destination: '/admin/users',
        permanent: false,
      },
      {
        source: '/categories',
        destination: '/admin/categories',
        permanent: false,
      },
      {
        source: '/employees',
        destination: '/admin/users',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
