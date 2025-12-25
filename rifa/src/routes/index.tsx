import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { RaffleDetailPage } from '@/pages/RaffleDetailPage';
import { MyTicketsPage } from '@/pages/MyTicketsPage';
import { PurchasePage } from '@/pages/PurchasePage';
import { PurchaseFormPage } from '@/pages/PurchaseFormPage';
import { PurchaseConfirmationPage } from '@/pages/PurchaseConfirmationPage';
import { PurchasePaymentPage } from '@/pages/PurchasePaymentPage';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';
import { PaymentCallbackPage } from '@/pages/PaymentCallbackPage';
import { PaymentResultPage } from '@/pages/PaymentResultPage';
import { ComoJugarPage } from '@/pages/ComoJugarPage';
import { TerminosPage } from '@/pages/TerminosPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ErrorPage } from '@/pages/ErrorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'auth/callback',
        element: <AuthCallbackPage />,
      },
      {
        path: 'payment/callback',
        element: <PaymentCallbackPage />,
      },
      {
        path: 'payment/result',
        element: <PaymentResultPage />,
      },
      {
        path: 'raffles/:id',
        element: <RaffleDetailPage />,
      },
      {
        path: 'my-tickets',
        element: <MyTicketsPage />,
      },
      {
        path: 'purchase/:id',
        element: <PurchasePage />,
      },
      {
        path: 'purchase/:id/form',
        element: <PurchaseFormPage />,
      },
      {
        path: 'purchase/:saleId/payment',
        element: <PurchasePaymentPage />,
      },
      {
        path: 'purchase/:saleId/confirmation',
        element: <PurchaseConfirmationPage />,
      },
      {
        path: 'como-jugar',
        element: <ComoJugarPage />,
      },
      {
        path: 'terminos-y-condiciones',
        element: <TerminosPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
      // Rutas futuras:
      // { path: 'checkout/:raffleId', element: <CheckoutPage /> },
    ],
  },
]);
