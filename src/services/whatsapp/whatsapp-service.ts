import { WhatsAppTemplate, WhatsAppMessage, WhatsAppCategory, Language } from '../../types';

const ALLOWED_VARIABLES = [
  'customer_name',
  'company_name',
  'product_name',
  'product_price',
  'product_quantity',
  'request_id',
  'request_date',
  'whatsapp',
  'catalog_url',
  'support_name',
];

const LOCAL_TEMPLATES_KEY = 'marketflow_whatsapp_templates';
const LOCAL_MESSAGES_KEY = 'marketflow_whatsapp_messages';

export class WhatsAppService {
  /**
   * Extrai e valida todas as variáveis {{placeholder}} presentes no texto do template
   */
  static extractAndValidateVariables(templateText: string): {
    valid: boolean;
    foundVariables: string[];
    invalidVariables: string[];
  } {
    const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    const foundVariables: string[] = [];
    const invalidVariables: string[] = [];

    let match;
    while ((match = regex.exec(templateText)) !== null) {
      const varName = match[1];
      if (!foundVariables.includes(varName)) {
        foundVariables.push(varName);
      }
      if (!ALLOWED_VARIABLES.includes(varName) && !invalidVariables.includes(varName)) {
        invalidVariables.push(varName);
      }
    }

    return {
      valid: invalidVariables.length === 0,
      foundVariables,
      invalidVariables,
    };
  }

  /**
   * Renderiza um template substituindo as variáveis dinâmicas
   */
  static renderTemplate(templateText: string, values: Record<string, string>): string {
    let rendered = templateText;
    Object.entries(values).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return rendered;
  }

  /**
   * Simulação de envio com filas e status
   */
  static async sendMessage(params: {
    companyId: string;
    recipientPhone: string;
    templateId?: string;
    requestId?: string;
    renderedText: string;
  }): Promise<WhatsAppMessage> {
    const newMessage: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      company_id: params.companyId,
      template_id: params.templateId,
      request_id: params.requestId,
      recipient_phone: params.recipientPhone,
      message_body: params.renderedText,
      provider: 'whatsapp_official_cloud',
      status: 'sending',
      retry_count: 0,
      max_retries: 3,
      created_at: new Date().toISOString(),
    };

    // Salva na fila
    const messages = this.getStoredMessages();
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify([newMessage, ...messages]));

    // Simula confirmação de entrega assíncrona após 800ms
    setTimeout(() => {
      const updatedMessages = this.getStoredMessages().map(m => {
        if (m.id === newMessage.id) {
          return {
            ...m,
            status: 'delivered' as const,
            provider_message_id: `wmid.${Math.random().toString(36).substring(2, 12)}`,
            sent_at: new Date().toISOString(),
            delivered_at: new Date(Date.now() + 500).toISOString(),
          };
        }
        return m;
      });
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updatedMessages));
    }, 800);

    return newMessage;
  }

  /**
   * Gestão de Templates de Mensagens no LocalStorage
   */
  static getStoredTemplates(companyId?: string): WhatsAppTemplate[] {
    try {
      const raw = localStorage.getItem(LOCAL_TEMPLATES_KEY);
      const templates: WhatsAppTemplate[] = raw ? JSON.parse(raw) : getSeedTemplates();
      if (companyId) {
        return templates.filter(t => t.company_id === companyId || t.is_system_default);
      }
      return templates;
    } catch {
      return getSeedTemplates();
    }
  }

  static saveTemplate(template: Omit<WhatsAppTemplate, 'id' | 'created_at' | 'updated_at'> & { id?: string }): WhatsAppTemplate {
    const templates = this.getStoredTemplates();
    const now = new Date().toISOString();

    if (template.id) {
      const updated = templates.map(t => {
        if (t.id === template.id) {
          return {
            ...t,
            ...template,
            updated_at: now,
          } as WhatsAppTemplate;
        }
        return t;
      });
      localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(updated));
      return updated.find(t => t.id === template.id)!;
    } else {
      const newT: WhatsAppTemplate = {
        ...template,
        id: `tpl-${Date.now()}`,
        created_at: now,
        updated_at: now,
      };
      localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify([newT, ...templates]));
      return newT;
    }
  }

  static getStoredMessages(companyId?: string): WhatsAppMessage[] {
    try {
      const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
      const messages: WhatsAppMessage[] = raw ? JSON.parse(raw) : getSeedMessages();
      if (companyId) {
        return messages.filter(m => m.company_id === companyId);
      }
      return messages;
    } catch {
      return getSeedMessages();
    }
  }
}

function getSeedTemplates(): WhatsAppTemplate[] {
  return [
    {
      id: 'tpl-1',
      company_id: 'comp-1',
      name: 'Confirmação de Solicitação',
      category: 'request',
      language: 'pt-BR',
      body_text: 'Olá {{customer_name}}! 👋\n\nRecebemos sua solicitação #{{request_id}} na empresa {{company_name}}.\n\nNossa equipe já está separando os itens. Confira nosso catálogo:\n{{catalog_url}}',
      variables: ['customer_name', 'request_id', 'company_name', 'catalog_url'],
      active: true,
      is_system_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'tpl-2',
      company_id: 'comp-1',
      name: 'Saudação do Catálogo',
      category: 'greeting',
      language: 'pt-BR',
      body_text: 'Olá! Seja bem-vindo ao atendimento da {{company_name}}! 🏬\n\nComo podemos te ajudar hoje? Para ver ofertas acesse: {{catalog_url}}',
      variables: ['company_name', 'catalog_url'],
      active: true,
      is_system_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'tpl-3',
      company_id: 'comp-1',
      name: 'Order Confirmation (EN)',
      category: 'confirmation',
      language: 'en',
      body_text: 'Hello {{customer_name}}! 👋\n\nYour request #{{request_id}} has been confirmed by {{company_name}}.\nThank you for choosing us!',
      variables: ['customer_name', 'request_id', 'company_name'],
      active: true,
      is_system_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

function getSeedMessages(): WhatsAppMessage[] {
  return [
    {
      id: 'msg-1',
      company_id: 'comp-1',
      recipient_phone: '(11) 98888-7777',
      message_body: 'Olá João! Recebemos sua solicitação #REQ-1042 no Mercadinho São Paulo.',
      provider: 'whatsapp_official_cloud',
      status: 'delivered',
      provider_message_id: 'wmid.hbGciOiJIUzI1',
      retry_count: 0,
      max_retries: 3,
      sent_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      delivered_at: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'msg-2',
      company_id: 'comp-1',
      recipient_phone: '(11) 97777-6666',
      message_body: 'Olá Maria! Seu pedido de Cesta Básica foi recebido com sucesso.',
      provider: 'whatsapp_official_cloud',
      status: 'read',
      provider_message_id: 'wmid.xYz99123aa',
      retry_count: 0,
      max_retries: 3,
      sent_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      delivered_at: new Date(Date.now() - 1000 * 60 * 119).toISOString(),
      read_at: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ];
}
