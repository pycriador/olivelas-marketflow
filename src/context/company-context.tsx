import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, CompanyUser, AppRole } from '../types';
import { mockCompanies, mockUserCompanies } from '../lib/supabase';
import { useAuth } from './auth-context';

const LOCAL_ALL_COMPANIES_KEY = 'marketflow_all_companies';

interface CompanyContextType {
  allCompanies: Company[];
  userCompanies: CompanyUser[];
  currentCompany: Company | null;
  currentRole: AppRole;
  switchCompany: (companyId: string) => void;
  createCompany: (data: Partial<Company>) => Promise<Company>;
  updateCompany: (companyId: string, data: Partial<Company>) => Promise<Company>;
  deleteCompany: (companyId: string) => Promise<void>;
  toggleBreakfastBasket: (companyId: string, enabled: boolean) => Promise<void>;
  canAdmin: boolean;
  canStock: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [allCompanies, setAllCompanies] = useState<Company[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_ALL_COMPANIES_KEY);
      const list: Company[] = stored ? JSON.parse(stored) : mockCompanies;
      const map = new Map<string, Company>();
      list.forEach(c => map.set(c.id, c));
      return Array.from(map.values());
    } catch {
      return mockCompanies;
    }
  });

  const [userCompanies, setUserCompanies] = useState<CompanyUser[]>(() => {
    const map = new Map<string, CompanyUser>();
    mockUserCompanies.forEach(cu => {
      const liveComp = allCompanies.find(c => c.id === cu.company_id);
      const enriched = liveComp ? { ...cu, company: liveComp } : cu;
      if (!map.has(cu.company_id)) {
        map.set(cu.company_id, enriched);
      }
    });
    return Array.from(map.values());
  });

  const [currentCompanyId, setCurrentCompanyId] = useState<string>(() => {
    return localStorage.getItem('marketflow-active-company') || allCompanies[0]?.id || mockCompanies[0].id;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_ALL_COMPANIES_KEY, JSON.stringify(allCompanies));
  }, [allCompanies]);

  useEffect(() => {
    if (allCompanies.length > 0 && !allCompanies.some(c => c.id === currentCompanyId)) {
      const firstId = allCompanies[0].id;
      setCurrentCompanyId(firstId);
      localStorage.setItem('marketflow-active-company', firstId);
    }
  }, [allCompanies, currentCompanyId]);

  const activeMembership = userCompanies.find(cu => cu.company_id === currentCompanyId);
  const currentCompany = allCompanies.find(c => c.id === currentCompanyId) || activeMembership?.company || allCompanies[0] || mockCompanies[0];
  const currentRole: AppRole = activeMembership?.role || 'global_admin';

  const switchCompany = (companyId: string) => {
    const target = allCompanies.find(c => c.id === companyId);
    if (target) {
      setCurrentCompanyId(companyId);
      localStorage.setItem('marketflow-active-company', companyId);

      // Se o usuário ainda não tiver membership nesta empresa (ex: Global Admin acessando tenant), adiciona dinamicamente
      if (!userCompanies.some(cu => cu.company_id === companyId)) {
        const adminMembership: CompanyUser = {
          id: `cu-admin-${companyId}`,
          company_id: companyId,
          user_id: user?.id || 'user-willian-global',
          role: 'global_admin',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          company: target,
        };
        setUserCompanies(prev => [adminMembership, ...prev]);
      }
    }
  };

  const createCompany = async (data: Partial<Company>): Promise<Company> => {
    const newComp: Company = {
      id: `comp-${Date.now()}`,
      name: data.name || 'Nova Empresa',
      legal_name: data.legal_name || '',
      cnpj: data.cnpj || '',
      slug: data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `empresa-${Date.now()}`),
      email: data.email || user?.email || '',
      phone: data.phone || '',
      whatsapp: data.whatsapp || '',
      description: data.description || '',
      subtitulo: data.subtitulo || '',
      moeda: data.moeda || 'BRL',
      avisoRodape: data.avisoRodape || '',
      breakfast_basket_enabled: data.breakfast_basket_enabled ?? false,
      active: true,
      created_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newMembership: CompanyUser = {
      id: `cu-${Date.now()}`,
      company_id: newComp.id,
      user_id: user?.id || 'user-willian-global',
      role: 'admin',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      company: newComp,
    };

    setAllCompanies(prev => [newComp, ...prev]);
    setUserCompanies(prev => [newMembership, ...prev]);
    setCurrentCompanyId(newComp.id);
    localStorage.setItem('marketflow-active-company', newComp.id);

    return newComp;
  };

  const updateCompany = async (companyId: string, data: Partial<Company>): Promise<Company> => {
    let updated: Company | null = null;
    setAllCompanies(prev =>
      prev.map(c => {
        if (c.id === companyId) {
          updated = {
            ...c,
            ...data,
            updated_at: new Date().toISOString(),
          };
          return updated;
        }
        return c;
      })
    );

    setUserCompanies(prev =>
      prev.map(cu => {
        if (cu.company_id === companyId && updated) {
          return { ...cu, company: updated };
        }
        return cu;
      })
    );

    if (!updated) throw new Error('Empresa não encontrada.');
    return updated;
  };

  const deleteCompany = async (companyId: string): Promise<void> => {
    setAllCompanies(prev => prev.filter(c => c.id !== companyId));
    setUserCompanies(prev => prev.filter(cu => cu.company_id !== companyId));
  };

  const toggleBreakfastBasket = async (companyId: string, enabled: boolean): Promise<void> => {
    await updateCompany(companyId, { breakfast_basket_enabled: enabled });
  };

  const canAdmin = currentRole === 'admin' || currentRole === 'global_admin';
  const canStock = canAdmin || currentRole === 'stock';

  return (
    <CompanyContext.Provider
      value={{
        allCompanies,
        userCompanies,
        currentCompany,
        currentRole,
        switchCompany,
        createCompany,
        updateCompany,
        deleteCompany,
        toggleBreakfastBasket,
        canAdmin,
        canStock,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany deve ser usado dentro de CompanyProvider');
  }
  return context;
};

