import React, { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, AlertCircle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { EmptyState } from '../../../components/ui/empty-state';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatDate } from '../../../lib/utils';
import { mockNotifications } from '../../../lib/supabase';
import { useCompany } from '../../../context/company-context';
import { AppNotification, NotificationType } from '../../../types';

export const NotificationListPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentCompany } = useCompany();
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    mockNotifications.filter(n => n.company_id === currentCompany?.id)
  );

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'danger':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      default:
        return <Info className="h-5 w-5 text-info" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Geral' }, { label: 'Notificações' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Central de Notificações</h1>
          <p className="text-sm text-muted-foreground">
            Alertas de estoque, validades de lotes e novidades do sistema.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4 text-primary" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nenhuma notificação registrada"
          description="Você receberá alertas aqui sobre movimentações, validades e solicitações."
        />
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center">
                <Bell className="mr-2 h-4 w-4 text-primary" /> Avisos e Alertas
              </span>
              <span className="text-xs text-muted-foreground">
                {unreadCount} não lidas
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`flex items-start justify-between p-4 transition-colors ${
                  !notif.read ? 'bg-primary/5 font-medium' : 'hover:bg-muted/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(notif.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {notif.link && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        markAsRead(notif.id);
                        onNavigate(notif.link!);
                      }}
                      className="text-xs"
                    >
                      Acessar <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
