import "./globals.css";
export const metadata = {
  title: "VDash - Dashboard",
  description: "Secure dashboard overlay for team coordinators",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=general-sans@200,300,400,500,600,700&f[]=ranade@200,300,400,500,600,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-app-bg flex justify-center items-center min-h-[100dvh] h-[100dvh] text-zinc-900 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
