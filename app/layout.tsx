import '@/app/globals.css';
import { QueryProvider } from "./providers/QueryProvider";
import { Navbar } from '@/app/components/NavBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>
          {/* Estructura básica del layout */}
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow p-4 md:p-6">
              {children}
            </main>
            {/* Opcional: Footer si lo necesitas */}
            {/* <Footer /> */}
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}