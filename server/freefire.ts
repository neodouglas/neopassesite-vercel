import { encrypt, decrypt } from './crypto';

/**
 * Serviço intermediário para consultar a API do Free Fire
 * Protege a URL da API externa e adiciona camada de segurança
 */

const FF_API_BASE = 'https://main.ffapi.cloud/api/freefire';

export interface AccountCredentials {
  uid: string;
  password: string;
}

export interface AccountInfo {
  id: number;
  nickname: string;
  level: number;
  xp: number;
  access_token: string;
}

/**
 * Parseia credenciais no formato UID:PASSWORD
 */
export function parseUidPassword(input: string): AccountCredentials | null {
  const trimmed = input.trim();
  
  // Formato UID:PASSWORD
  if (trimmed.includes(':')) {
    const [uid, password] = trimmed.split(':');
    if (uid && password) {
      return { uid: uid.trim(), password: password.trim() };
    }
  }
  
  return null;
}

/**
 * Parseia credenciais no formato JSON da Garena
 */
export function parseGarenaJson(input: string): AccountCredentials | null {
  try {
    const data = JSON.parse(input);
    
    if (data.guest_account_info) {
      const uid = data.guest_account_info['com.garena.msdk.guest_uid'];
      const password = data.guest_account_info['com.garena.msdk.guest_password'];
      
      if (uid && password) {
        return { uid, password };
      }
    }
  } catch (error) {
    // Não é JSON válido
    return null;
  }
  
  return null;
}

/**
 * Parseia entrada do usuário em qualquer formato suportado
 */
export function parseAccountInput(input: string): AccountCredentials | null {
  // Tenta formato JSON primeiro
  const jsonResult = parseGarenaJson(input);
  if (jsonResult) return jsonResult;
  
  // Tenta formato UID:PASSWORD
  const uidPasswordResult = parseUidPassword(input);
  if (uidPasswordResult) return uidPasswordResult;
  
  return null;
}

/**
 * Consulta informações da conta na API externa
 */
export async function fetchAccountInfo(credentials: AccountCredentials): Promise<AccountInfo> {
  const { uid, password } = credentials;
  
  const url = `${FF_API_BASE}/account/guest/info?uid=${encodeURIComponent(uid)}&password=${encodeURIComponent(password)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API retornou erro: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Valida estrutura da resposta
    if (!data.id || !data.nickname) {
      throw new Error('Resposta da API inválida');
    }
    
    return {
      id: data.id,
      nickname: data.nickname,
      level: data.level || 0,
      xp: data.xp || 0,
      access_token: data.access_token || '',
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao consultar conta: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao consultar conta');
  }
}

/**
 * Criptografa credenciais para armazenamento seguro
 */
export function encryptCredentials(credentials: AccountCredentials): string {
  const json = JSON.stringify(credentials);
  return encrypt(json);
}

/**
 * Descriptografa credenciais armazenadas
 */
export function decryptCredentials(encrypted: string): AccountCredentials {
  const json = decrypt(encrypted);
  return JSON.parse(json);
}

