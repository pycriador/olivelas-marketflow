import React, { useState } from 'react';
import { ShieldAlert, Laptop, Smartphone, Globe, LogOut, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatDate } from '../../../lib/utils';
import { ActiveSession } from '../../../types';

export const UserSessionsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 'sess-1',
      user_id: 'user-willian-global',
      user_email: 'willian.o.jesus@gmail.com',
      device: 'Windows Desktop (PC)',
      browser: 'Chrome 128.0',
      ip_address: '177.12.34.56',
      location: 'São Paulo, Brasil',
      last_active: new Date().toISOString(),
      is_current: true,
    },
    {
      id: 'sess-2',
      user_id: 'user-willian-global',
      user_email: 'willian.o.jesus@gmail.com',
      device: 'iPhone 15 Pro (Mobile)',
      browser: 'Safari Mobile',
      ip_address: '177.12.34.88',
      location: 'São Paulo, Brasil',
      last_active: new Date(Date.now() - 3600000 * 3).toISOString(),
      is_current: false,
    },
    {
      id: 'sess-3',
      user_id: 'user-maria',
      user_email: 'maria.estoque@marketflow.com',
      device: 'Android Tablet',
      browser: 'Chrome Mobile',
      ip_address: '189.44.12.90',
      location: 'Osasco, Brasil',
      last_active: new Date(Date.now() - 3600000 * 12).toISOString(),
      is_current: false,
    },
  ]);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Administração' }, { label: 'Usuários', href: '#' }, { label: 'Sessões Ativas' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Dispositivos e Sessões Ativas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie onde sua conta está conectada e encerre conexões remotamente para segurança.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <ShieldAlert className="mr-2 h-4 w-4 text-primary" /> Conexões Ativas ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
          {sessions.map(sess => (
            <div key={sess.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-muted/30">
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {sess.device.includes('Mobile') || sess.device.includes('iPhone') ? (
                    <Smartphone className="h-5 w-5" />
                  ) : (
                    <Laptop className="h-5 w-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-foreground">{sess.device}</span>
                    {sess.is_current ? (
                      <Badge variant="success" className="text-[10px]">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Dispositivo Atual
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Conectado</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sess.browser} • IP: {sess.ip_address} ({sess.location})
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Usuário: <span className="font-semibold text-foreground">{sess.user_email}</span> • Última atividade: {formatDate(sess.last_active)}
                  </p>
                </div>
              </div>

              {!sess.is_current && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeSession(sess.id)}
                  className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" /> Desconectar Dispositivo
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
