# 🔌 In-Browser API Gateway e OpenAPI 3.0

## 1. Objetivo
Especificar a arquitetura do Gateway de API REST emulado no navegador (`src/api/v1/router.ts`) e o portal interativo de documentação com Swagger / OpenAPI 3.0 (`src/pages/admin/api/api-page.tsx`).

---

## 2. Visão Geral
Para permitir que ERPs legados, sistemas de PDV externos e plataformas de e-commerce integrem com o MarketFlow mesmo quando hospedado em ambiente estático no GitHub Pages, o sistema conta com um **API Gateway Emulado no Navegador**.

O gateway implementa autenticação via Bearer Token identificável, armazenamento seguro de hashes SHA-256, Rate Limiting baseado em janela deslizante e documentação OpenAPI 3.0 navegável e executável.

---

## 3. Responsabilidades do Módulo
- Gerar e validar API Keys identificáveis: `mf_live_...` (produção) e `mf_test_...` (sandbox).
- Persistir apenas o hash SHA-256 da chave e o prefixo visível no banco/storage. O token pleno é exibido estritamente uma única vez no momento da criação.
- Aplicar **Rate Limiting de 60 requisições por minuto** por token de acesso.
- Registrar log de auditoria com método HTTP, rota, código de status e latência em milissegundos.
- Servir a especificação OpenAPI 3.0 e a interface Swagger interativa.

---

## 4. Fluxo Interno: Processamento de Requisições da API

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Sistema Externo / Swagger
    participant GW as ApiRouter (src/api/v1/router.ts)
    participant Rate as Rate Limiter (60 req/min)
    participant Auth as Auth & Scope Validator
    participant DS as DataStore
    participant Log as ApiRequestLog

    Dev->>GW: HTTP Request (GET /api/v1/products com Bearer Token)
    GW->>Rate: Verifica limite de chamadas
    alt Limite Excedido (> 60 req/min)
        Rate-->>Dev: HTTP 429 Too Many Requests
    else Limite Válido
        GW->>Auth: Valida hash SHA-256 e escopo 'products:read'
        alt Token Inválido ou Sem Permissão
            Auth-->>Dev: HTTP 401 Unauthorized ou 403 Forbidden
        else Autorizado
            GW->>DS: dataStore.getProducts(companyId)
            DS-->>GW: Retorna lista de produtos
            GW->>Log: Registra chamada no histórico de requisições
            GW-->>Dev: HTTP 200 OK com payload JSON
        end
    end
```

---

## 5. Relação com Outros Módulos
- **[Gestão de Produtos e Validade](../modules/01-produtos-e-validade.md):** Expõe endpoints para consulta e criação de produtos via API.
- **[Controle de Estoque e Lotes](../modules/02-estoque-e-lotes.md):** Expõe endpoints para consulta de inventário.
- **[Gerenciamento de Estado](../architecture/03-gerenciamento-de-estado.md):** Opera diretamente sobre os dados do `DataStore`.

---

## 6. Especificação das Chaves de API

| Ambiente | Prefixo do Token | Exemplo Gerado |
| :--- | :--- | :--- |
| **Produção** | `mf_live_` | `mf_live_9a8b7c6d5e4f3a2b1c0d9e8f` |
| **Sandbox / Teste** | `mf_test_` | `mf_test_1f2e3d4c5b6a7f8e9d0c1b2a` |

---

## 7. Exemplos Práticos

### Chamada cURL Simulatória
```bash
curl -X GET "https://pycriador.github.io/olivelas-marketflow/api/v1/products" \
  -H "Authorization: Bearer mf_live_9a8b7c6d5e4f3a2b1c0d9e8f" \
  -H "Content-Type: application/json"
```

### Formato de Resposta de Erro Padronizada
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Limite de 60 requisições por minuto atingido para esta chave.",
    "retry_after_seconds": 24
  }
}
```

---

## 8. Referências para Outros Documentos
- [Modelo Relacional de Dados](../architecture/02-modelo-de-dados.md)
- [Gerenciamento de Estado](../architecture/03-gerenciamento-de-estado.md)
- [Gestão de Produtos e Validade](../modules/01-produtos-e-validade.md)
