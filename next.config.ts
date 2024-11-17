import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
const port = process.env.PORT || 3000;

module.exports = {
  serverRuntimeConfig: {
    port,
  },
};

export default nextConfig;
