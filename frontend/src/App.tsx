import { createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router'
import { RootLayout } from '@/layouts/RootLayout'
import { ContentLayout } from '@/layouts/ContentLayout'
import { HomePage } from '@/pages/HomePage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { TermsPage } from '@/pages/TermsPage'
import { TalentNetworkPage } from '@/pages/TalentNetworkPage'
import { AboutPage } from '@/pages/AboutPage'

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

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: () => (
    <ContentLayout>
      <TermsPage />
    </ContentLayout>
  ),
})

const talentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/talent',
  component: () => (
    <ContentLayout>
      <TalentNetworkPage />
    </ContentLayout>
  ),
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: () => (
    <ContentLayout>
      <AboutPage />
    </ContentLayout>
  ),
})

const routeTree = rootRoute.addChildren([indexRoute, privacyRoute, termsRoute, talentRoute, aboutRoute])

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
