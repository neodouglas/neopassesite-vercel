/**
 * Script de teste para validar a API de consulta de contas
 */

import { parseAccountInput, fetchAccountInfo } from './server/freefire';

async function testAPI() {
  console.log('=== Teste da API de Consulta de Contas Free Fire ===\n');

  // Teste 1: Formato UID:PASSWORD
  console.log('Teste 1: Formato UID:PASSWORD');
  const input1 = '4218401841:42707FEA480532FEC584880BBCE1C99E1C979C84F912E314ED09A505FD071D4C';
  const credentials1 = parseAccountInput(input1);
  
  if (credentials1) {
    console.log('✓ Credenciais parseadas com sucesso');
    console.log(`  UID: ${credentials1.uid}`);
    console.log(`  Password: ${credentials1.password.substring(0, 20)}...`);
    
    try {
      const accountInfo = await fetchAccountInfo(credentials1);
      console.log('✓ Consulta à API bem-sucedida');
      console.log(`  ID: ${accountInfo.id}`);
      console.log(`  Nickname: ${accountInfo.nickname}`);
      console.log(`  Level: ${accountInfo.level}`);
      console.log(`  XP: ${accountInfo.xp}`);
      console.log(`  Access Token: ${accountInfo.access_token.substring(0, 20)}...`);
    } catch (error) {
      console.error('✗ Erro ao consultar API:', error);
    }
  } else {
    console.error('✗ Falha ao parsear credenciais');
  }

  console.log('\n---\n');

  // Teste 2: Formato JSON da Garena
  console.log('Teste 2: Formato JSON da Garena');
  const input2 = '{"guest_account_info":{"com.garena.msdk.guest_uid":"4218099837","com.garena.msdk.guest_password":"C95587DF1ECEA5E312FEFE89E04F38CE75A8E785CEBF5910407373AB37FFA474"}}';
  const credentials2 = parseAccountInput(input2);
  
  if (credentials2) {
    console.log('✓ Credenciais JSON parseadas com sucesso');
    console.log(`  UID: ${credentials2.uid}`);
    console.log(`  Password: ${credentials2.password.substring(0, 20)}...`);
  } else {
    console.error('✗ Falha ao parsear credenciais JSON');
  }

  console.log('\n---\n');

  // Teste 3: Formato inválido
  console.log('Teste 3: Formato inválido');
  const input3 = 'formato-invalido-123';
  const credentials3 = parseAccountInput(input3);
  
  if (credentials3 === null) {
    console.log('✓ Formato inválido detectado corretamente');
  } else {
    console.error('✗ Formato inválido não foi detectado');
  }

  console.log('\n=== Testes Concluídos ===');
}

testAPI().catch(console.error);
