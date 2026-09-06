export type AppRole = 'global_admin' | 'admin' | 'stock' | 'visitor';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  legal_name?: string;
  cnpj?: string;
  slug: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  logo_url?: string;
  description?: string;
  breakfast_basket_enabled?: boolean;
  subtitulo?: string;
  moeda?: string;
  avisoRodape?: string;
  active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: AppRole;
  active: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  company?: Company;
}

export interface Category {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Manufacturer {
  id: string;
  company_id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Brand {
  id: string;
  company_id: string;
  name: string;
  manufacturer_id?: string;
  logo_url?: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  manufacturer?: Manufacturer;
}

export interface Supplier {
  id: string;
  company_id: string;
  name: string;
  legal_name?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  contact_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Product {
  id: string;
  company_id: string;
  category_id?: string;
  brand_id?: string;
  manufacturer_id?: string;
  default_supplier_id?: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  unit: string;
  weight?: number;
  volume?: number;
  cost_price: number;
  sale_price: number;
  promotional_price?: number;
  minimum_stock: number;
  maximum_stock?: number;
  image_url?: string;
  expiration_date?: string;
  active: boolean;
  catalog_visible: boolean;
  show_price: boolean;
  allow_contact: boolean;
  active_in_basket?: boolean;
  basket_sizes?: ('pequena' | 'media' | 'grande')[];
  drink_tier?: 'P' | 'M' | 'G';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  category?: Category;
  brand?: Brand;
  manufacturer?: Manufacturer;
  supplier?: Supplier;
  inventory?: InventoryItem;
}

export interface InventoryItem {
  id: string;
  company_id: string;
  product_id: string;
  quantity: number;
  reserved_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Lot {
  id: string;
  company_id: string;
  product_id: string;
  supplier_id?: string;
  lot_number: string;
  manufacturing_date?: string;
  expiration_date?: string;
  initial_quantity: number;
  current_quantity: number;
  cost_price?: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  supplier?: Supplier;
}

export type MovementType = 'entry' | 'exit' | 'adjustment' | 'loss' | 'expired' | 'inventory';

export interface InventoryMovement {
  id: string;
  company_id: string;
  product_id: string;
  lot_id?: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  reference_id?: string;
  performed_by?: string;
  created_at: string;
  product?: Product;
  lot?: Lot;
  performer?: Profile;
}

export interface CatalogConfig {
  id: string;
  company_id: string;
  enabled: boolean;
  banner_url?: string;
  description?: string;
  whatsapp_number?: string;
  email_contact?: string;
  allow_product_requests: boolean;
  created_at: string;
  updated_at: string;
}

export type Language = 'pt-BR' | 'en' | 'es';

export interface ProductAnalysisResult {
  suggested_name?: string;
  suggested_description?: string;
  suggested_price?: number;
  suggested_cost_price?: number;
  barcode?: string;
  unit?: string;
  suggested_category?: string;
  suggested_brand?: string;
  confidence_score: number;
  notes?: string;
}

export interface AiRecognitionResult {
  product_name?: string;
  barcode?: string;
  suggested_category?: string;
  suggested_brand?: string;
  confidence_score: number;
  notes?: string;
}

export type RequestStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

export interface CatalogRequestItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price?: number;
}

export interface CatalogRequest {
  id: string;
  company_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  notes?: string;
  status: RequestStatus;
  items: CatalogRequestItem[];
  created_at: string;
  updated_at: string;
}

export type NotificationType = 'warning' | 'danger' | 'info' | 'success';

export interface AppNotification {
  id: string;
  company_id: string;
  user_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface UserInvitation {
  id: string;
  company_id: string;
  email: string;
  role: AppRole;
  token: string;
  status: InvitationStatus;
  invited_by: string;
  expires_at: string;
  created_at: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  user_email: string;
  device: string;
  browser: string;
  ip_address: string;
  location: string;
  last_active: string;
  is_current: boolean;
}

export interface PermissionMatrixItem {
  module: string;
  resource: string;
  action: string;
  allowed_roles: AppRole[];
}

// API Keys & Tokens
export type ApiEnvironment = 'live' | 'test';
export type ApiKeyStatus = 'active' | 'revoked' | 'expired';

export type ApiScope =
  | 'products:read'
  | 'products:write'
  | 'categories:read'
  | 'categories:write'
  | 'brands:read'
  | 'brands:write'
  | 'manufacturers:read'
  | 'manufacturers:write'
  | 'suppliers:read'
  | 'suppliers:write'
  | 'inventory:read'
  | 'inventory:write'
  | 'lots:read'
  | 'lots:write'
  | 'catalog:read'
  | 'catalog:write'
  | 'requests:read'
  | 'requests:write'
  | 'ai:use'
  | 'reports:read';

export interface ApiKey {
  id: string;
  company_id: string;
  created_by?: string;
  name: string;
  description?: string;
  key_prefix: string;
  secret_hash: string;
  plain_secret_once?: string; // Present only on creation modal
  environment: ApiEnvironment;
  scopes: ApiScope[];
  status: ApiKeyStatus;
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
  revoked_at?: string;
}

export interface ApiRequestLog {
  id: string;
  company_id: string;
  api_key_id?: string;
  endpoint: string;
  method: string;
  status_code: number;
  duration_ms: number;
  ip_address?: string;
  user_agent?: string;
  idempotency_key?: string;
  correlation_id?: string;
  error_code?: string;
  created_at: string;
}

// AI Abstraction & Jobs
export type AIProviderType = 'openai' | 'gemini' | 'anthropic' | 'mock';
export type AIJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface AIJob {
  id: string;
  company_id: string;
  user_id?: string;
  job_type: 'product_analysis' | 'shelf_recognition' | 'ocr';
  provider: AIProviderType;
  status: AIJobStatus;
  input_data: any;
  output_data?: any;
  confidence_score?: number;
  requires_human_review: boolean;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface AIUsageLog {
  id: string;
  company_id: string;
  user_id?: string;
  job_id?: string;
  provider: AIProviderType;
  model: string;
  operation: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
  status: 'success' | 'failed';
  created_at: string;
}

export interface ShelfRecognitionResult {
  estimated_total_items: number;
  detected_categories: string[];
  empty_spaces_count: number;
  potential_out_of_stock: string[];
  confidence_score: number;
  requires_human_review: boolean;
  notes: string;
}

// WhatsApp Engine & Templates
export type WhatsAppCategory =
  | 'greeting'
  | 'product'
  | 'order'
  | 'request'
  | 'stock'
  | 'confirmation'
  | 'cancellation'
  | 'contact'
  | 'support'
  | 'error';

export interface WhatsAppTemplate {
  id: string;
  company_id: string;
  name: string;
  category: WhatsAppCategory;
  language: 'pt-BR' | 'en' | 'es';
  body_text: string;
  variables: string[];
  active: boolean;
  is_system_default: boolean;
  created_at: string;
  updated_at: string;
}

export type WhatsAppStatus = 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppMessage {
  id: string;
  company_id: string;
  template_id?: string;
  request_id?: string;
  recipient_phone: string;
  message_body: string;
  provider: string;
  status: WhatsAppStatus;
  provider_message_id?: string;
  retry_count: number;
  max_retries: number;
  error_details?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_at?: string;
  created_at: string;
}

// Webhooks
export type WebhookEvent =
  | 'product.created'
  | 'product.updated'
  | 'inventory.updated'
  | 'catalog.published'
  | 'catalog.request.created'
  | 'user.invited'
  | 'ai.job.completed'
  | 'ai.job.failed';

export interface WebhookEndpoint {
  id: string;
  company_id: string;
  url: string;
  description?: string;
  secret: string;
  events: WebhookEvent[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  endpoint_id: string;
  event: WebhookEvent;
  payload: any;
  response_status?: number;
  response_body?: string;
  duration_ms?: number;
  status: 'pending' | 'success' | 'failed';
  attempt_count: number;
  created_at: string;
}

// Standard REST Envelope
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    page_size?: number;
    total?: number;
    timestamp?: string;
    correlation_id?: string;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Cesta de Café da Manhã Types & JSON Schema
export interface BasketStoreConfig {
  nome: string;
  subtitulo: string;
  whatsapp: string;
  moeda: string;
  heroImagem: string;
  avisoRodape: string;
}

export interface BasketSize {
  id: 'pequena' | 'media' | 'grande';
  nome: string;
  maxItens: number;
  precoBase: number;
  bebidaTier: 'P' | 'M' | 'G';
  resumo: string;
  destaque?: boolean;
}

export interface BasketRules {
  categoriasObrigatorias: string[];
  mensagemObrigatoria: string;
  permiteRepetirItem: boolean;
}

export interface BasketProductItem {
  id: string;
  nome: string;
  marca: string;
  preco: number;
  tamanhoBebida?: 'P' | 'M' | 'G';
  tamanhos: ('pequena' | 'media' | 'grande')[];
}

export interface BasketCategoryItem {
  id: string;
  nome: string;
  contaNoLimite: boolean;
  itens: BasketProductItem[];
}

export interface BreakfastBasketExportJson {
  loja: BasketStoreConfig;
  tamanhos: BasketSize[];
  regras: BasketRules;
  categorias: BasketCategoryItem[];
}
