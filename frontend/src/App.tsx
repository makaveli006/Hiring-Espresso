import { createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router'
import { RootLayout } from '@/layouts/RootLayout'
import { ContentLayout } from '@/layouts/ContentLayout'
import { HomePage } from '@/pages/HomePage'
import { PrivacyPage } from '@/pages/PrivacyPage'

const rootRoute = createRootRoute()

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <RootLayout>
      <HomePage />
    </RootLayout>
  ),
})

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: () => (
    <ContentLayout>
      <PrivacyPage />
    </ContentLayout>
  ),
})

const routeTree = rootRoute.addChildren([indexRoute, privacyRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return <RouterProvider router={router} />
}

export default App
