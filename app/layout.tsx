import type { Metadata } from 'next'
import './globals.css'
import { AuthSessionProvider } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Inkwell - AI-Assisted Story Writing',
  description: 'A distraction-free creative writing application with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const themes = ['light', 'dark', 'sepia', 'novelai', 'midnight', 'nord', 'forest'];
                  const stored = localStorage.getItem('theme');
                  const theme = (stored && themes.includes(stored)) ? stored : 'novelai';
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-writer-sans" suppressHydrationWarning>
        <AuthSessionProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
