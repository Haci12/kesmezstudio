/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // erzeugt beim Build den Ordner "out" mit der fertigen statischen Seite
  trailingSlash: true, // /impressum/ statt /impressum, passt zu einfachem Webhosting
  images: { unoptimized: true },
};

export default nextConfig;
