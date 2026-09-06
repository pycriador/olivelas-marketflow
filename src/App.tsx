import React, { useState } from 'react';
import { useAuth } from './context/auth-context';
import { AdminLayout } from './components/layout/admin-layout';
import { DashboardPage } from './pages/admin/dashboard';
import { ProductListPage } from './pages/admin/products/product-list';
import { ProductFormPage } from './pages/admin/products/product-form';
import { ProductImportPage } from './pages/admin/products/product-import';
import { ProductLabelsPage } from './pages/admin/products/product-labels';
import { PriceHistoryPage } from './pages/admin/products/price-history';
import { CategoryListPage } from './pages/admin/categories/category-list';
import { BrandListPage } from './pages/admin/brands/brand-list';
import { ManufacturerListPage } from './pages/admin/manufacturers/manufacturer-list';
import { SupplierListPage } from './pages/admin/suppliers/supplier-list';
import { InventoryOverviewPage } from './pages/admin/inventory/inventory-overview';
import { LotListPage } from './pages/admin/lots/lot-list';
import { AiAssistantPage } from './pages/admin/ai/ai-assistant';
import { CatalogSettingsPage } from './pages/admin/catalog/catalog-settings';
import { CatalogRequestsPage } from './pages/admin/catalog/catalog-requests';
import { NotificationListPage } from './pages/admin/notifications/notification-list';
import { ReportsOverviewPage } from './pages/admin/reports/reports-overview';
import { AuditLogPage } from './pages/admin/audit/audit-log';
import { UserListPage } from './pages/admin/users/user-list';
import { UserInvitationsPage } from './pages/admin/users/user-invitations';
import { UserSessionsPage } from './pages/admin/users/user-sessions';
import { UserPermissionsMatrixPage } from './pages/admin/users/user-permissions-matrix';
import { GlobalAdminDashboardPage } from './pages/admin/global/global-admin-dashboard';
import { ApiKeysPage } from './pages/admin/developers/api-keys';
import { ApiDocsPage } from './pages/admin/developers/api-docs';
import { WebhooksPage } from './pages/admin/developers/webhooks';
import { DeveloperDashboardPage } from './pages/admin/developers/developer-dashboard';
import { WhatsAppSettingsPage } from './pages/admin/whatsapp/whatsapp-settings';
import { BreakfastBasketSettingsPage } from './pages/admin/basket/breakfast-basket-settings';
import { GlobalAdminCompaniesPage } from './pages/admin/global/global-admin-companies';
import { BasketBuilderPage } from './pages/public/basket-builder';
import { MovementListPage } from './pages/admin/movements/movement-list';
import { CompanyProfilePage } from './pages/admin/company/company-profile-page';
import { dataStore } from './lib/data-store';
import { LoginPage } from './pages/auth/login';
import { PublicStorePage } from './pages/public/public-store';
import { LandingPage } from './pages/public/landing-page';
import { Product } from './types';

const GITHUB_REPO_PREFIX = '/olivelas-marketflow';

// Função utilitária para obter o caminho relativo à aplicação
function getAppPath(pathname: string): string {
  if (pathname.startsWith(GITHUB_REPO_PREFIX)) {
    const stripped = pathname.substring(GITHUB_REPO_PREFIX.length);
    return stripped || '/';
  }
  return pathname || '/';
}

// Função utilitária para transformar rota relativa na rota absoluta do navegador
function getBrowserPath(path: string): string {
  if (window.location.pathname.startsWith(GITHUB_REPO_PREFIX)) {
    return `${GITHUB_REPO_PREFIX}${path}`;
  }
  return path;
}

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const appPath = getAppPath(window.location.pathname);
    if (appPath && appPath !== '/') return appPath;
    return '/admin/dashboard';
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(() => {
    const appPath = getAppPath(window.location.pathname);
    const match = appPath.match(/^\/admin\/products\/([a-zA-Z0-9_-]+)$/);
    if (match && match[1] !== 'new' && match[1] !== 'edit' && match[1] !== 'import' && match[1] !== 'labels' && match[1] !== 'price-history') {
      return dataStore.getProductById(match[1]) || null;
    }
    return null;
  });

  // Sincronização bidirecional com o histórico de navegação do browser (URL) e sync com Supabase
  React.useEffect(() => {
    // Sincroniza dados com o Supabase em background
    dataStore.syncWithRemote();

    const handlePopState = () => {
      const appPath = (getAppPath(window.location.pathname) || '/admin/dashboard').split('?')[0];
      setCurrentPath(appPath);

      const match = appPath.match(/^\/admin\/products\/([a-zA-Z0-9_-]+)$/);
      if (match && match[1] !== 'new' && match[1] !== 'edit' && match[1] !== 'import' && match[1] !== 'labels' && match[1] !== 'price-history') {
        setEditingProduct(dataStore.getProductById(match[1]) || null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const cleanPath = path.split('?')[0];
    const targetBrowserUrl = getBrowserPath(path);
    const currentBrowserUrl = window.location.pathname + window.location.search;
    if (targetBrowserUrl !== currentBrowserUrl) {
      window.history.pushState({}, '', targetBrowserUrl);
    }

    if (cleanPath === '/admin/products/new') {
      setEditingProduct(null);
      setCurrentPath('/admin/products/edit');
      return;
    }

    const editMatch = cleanPath.match(/^\/admin\/products\/([a-zA-Z0-9_-]+)$/);
    if (editMatch && editMatch[1] !== 'new' && editMatch[1] !== 'edit' && editMatch[1] !== 'import' && editMatch[1] !== 'labels' && editMatch[1] !== 'price-history') {
      const prod = dataStore.getProductById(editMatch[1]);
      if (prod) {
        setEditingProduct(prod);
        setCurrentPath(cleanPath);
        return;
      }
    }

    setCurrentPath(cleanPath);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    const targetUrl = `/admin/products/${product.id}`;
    const targetBrowserUrl = getBrowserPath(targetUrl);
    if (window.location.pathname !== targetBrowserUrl) {
      window.history.pushState({}, '', targetBrowserUrl);
    }
    setCurrentPath(targetUrl);
  };

  // Tratamento da Vitrine Digital Pública & Monte sua Cesta & Produto Específico
  if (currentPath.startsWith('/loja/')) {
    const isBasket = currentPath.endsWith('/cesta');
    const productMatch = currentPath.match(/^\/loja\/([a-zA-Z0-9_-]+)\/produto\/([a-zA-Z0-9_-]+)$/);

    if (productMatch) {
      const storeSlug = productMatch[1];
      const prodId = productMatch[2];
      return (
        <PublicStorePage
          slug={storeSlug}
          productId={prodId}
          onBackToAdmin={() => navigate('/admin/dashboard')}
          onNavigateBasket={() => navigate(`/loja/${storeSlug}/cesta`)}
          onNavigateStore={(newSlug) => navigate(`/loja/${newSlug}`)}
          onSelectProduct={(p) => navigate(`/loja/${storeSlug}/produto/${p.id}`)}
          onCloseProduct={() => navigate(`/loja/${storeSlug}`)}
        />
      );
    }

    const slug = isBasket
      ? currentPath.replace('/loja/', '').replace('/cesta', '')
      : currentPath.replace('/loja/', '');

    if (isBasket) {
      return (
        <BasketBuilderPage
          slug={slug}
          onBackToStore={() => navigate(`/loja/${slug}`)}
          onNavigateStore={(newSlug) => navigate(`/loja/${newSlug}/cesta`)}
        />
      );
    }

    return (
      <PublicStorePage
        slug={slug}
        onBackToAdmin={() => navigate('/admin/dashboard')}
        onNavigateBasket={() => navigate(`/loja/${slug}/cesta`)}
        onNavigateStore={(newSlug) => navigate(`/loja/${newSlug}`)}
        onSelectProduct={(p) => navigate(`/loja/${slug}/produto/${p.id}`)}
        onCloseProduct={() => navigate(`/loja/${slug}`)}
      />
    );
  }

  // Tratamento da Landing Page Pública
  if (currentPath === '/landing') {
    return (
      <LandingPage
        onNavigateLogin={() => navigate('/admin/dashboard')}
        onNavigateCatalogDemo={() => navigate('/loja/mercado-central')}
      />
    );
  }

  // Tratamento de Autenticação
  if (!isAuthenticated) {
    return (
      <LoginPage
        onNavigateToSignup={() => {}}
        onSuccess={() => navigate('/admin/dashboard')}
      />
    );
  }

  const renderContent = () => {
    switch (currentPath) {
      case '/admin/dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case '/admin/global':
        return <GlobalAdminDashboardPage />;
      case '/admin/global/companies':
        return <GlobalAdminCompaniesPage onNavigate={navigate} />;
      case '/admin/breakfast-basket':
        return <BreakfastBasketSettingsPage onNavigate={navigate} />;
      case '/admin/notifications':
        return <NotificationListPage onNavigate={navigate} />;
      case '/admin/products':
        return (
          <ProductListPage
            onNavigate={navigate}
            onEditProduct={handleEditProduct}
          />
        );
      case '/admin/products/edit':
        return (
          <ProductFormPage
            initialProduct={editingProduct}
            onBack={() => setCurrentPath('/admin/products')}
            onSaved={() => setCurrentPath('/admin/products')}
          />
        );
      case '/admin/products/price-history':
        return <PriceHistoryPage onBack={() => setCurrentPath('/admin/products')} />;
      case '/admin/products/import':
        return (
          <ProductImportPage
            onBack={() => setCurrentPath('/admin/products')}
            onImportComplete={() => setCurrentPath('/admin/products')}
          />
        );
      case '/admin/products/labels':
        return <ProductLabelsPage onBack={() => setCurrentPath('/admin/products')} />;
      case '/admin/categories':
        return <CategoryListPage />;
      case '/admin/brands':
        return <BrandListPage />;
      case '/admin/manufacturers':
        return <ManufacturerListPage />;
      case '/admin/suppliers':
        return <SupplierListPage />;
      case '/admin/inventory':
        return <InventoryOverviewPage />;
      case '/admin/lots':
        return <LotListPage />;
      case '/admin/movements':
        return <MovementListPage onNavigate={navigate} />;
      case '/admin/ai':
        return <AiAssistantPage onNavigate={navigate} />;
      case '/admin/catalog':
        return <CatalogSettingsPage />;
      case '/admin/catalog/requests':
        return <CatalogRequestsPage />;
      case '/admin/reports':
        return <ReportsOverviewPage />;
      case '/admin/audit':
        return <AuditLogPage />;
      case '/admin/users':
        return <UserListPage onNavigate={navigate} />;
      case '/admin/users/invitations':
        return <UserInvitationsPage onBack={() => navigate('/admin/users')} />;
      case '/admin/users/sessions':
        return <UserSessionsPage onBack={() => navigate('/admin/users')} />;
      case '/admin/users/permissions':
        return <UserPermissionsMatrixPage onBack={() => navigate('/admin/users')} />;
      case '/admin/developers/dashboard':
        return <DeveloperDashboardPage onNavigate={navigate} />;
      case '/admin/developers/api-keys':
        return <ApiKeysPage onNavigate={navigate} />;
      case '/admin/developers/api-docs':
        return <ApiDocsPage onNavigate={navigate} />;
      case '/admin/developers/webhooks':
        return <WebhooksPage />;
      case '/admin/whatsapp':
        return <WhatsAppSettingsPage />;
      case '/admin/company':
        return <CompanyProfilePage />;
      default:
        // Rota dinâmica para edição de produto específico com ID único: /admin/products/:productId
        if (currentPath.startsWith('/admin/products/') && currentPath !== '/admin/products/new') {
          const productId = currentPath.replace('/admin/products/', '');
          const product = editingProduct || dataStore.getProductById(productId);
          return (
            <ProductFormPage
              initialProduct={product}
              onBack={() => navigate('/admin/products')}
              onSaved={() => navigate('/admin/products')}
            />
          );
        }
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <AdminLayout currentPath={currentPath} onNavigate={navigate}>
      {renderContent()}
    </AdminLayout>
  );
};
