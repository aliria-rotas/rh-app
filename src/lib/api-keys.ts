/**
 * Gerenciador de tokens de API
 * Tokens são carregados de variáveis de ambiente por segurança
 */

export function validateApiToken(token: string): boolean {
  const expectedToken = process.env.VITE_CLIMATE_API_TOKEN
  if (!expectedToken) {
    console.error('API token not configured in environment')
    return false
  }
  return token === expectedToken
}

export function getApiTokenInfo(token: string) {
  const expectedToken = process.env.VITE_CLIMATE_API_TOKEN
  if (token === expectedToken) {
    return { name: 'climate-survey-v1', created: '2026-06-12', use: 'Google Forms Integration' }
  }
  return null
}
