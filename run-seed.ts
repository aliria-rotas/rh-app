import { seedIfNeeded } from './src/lib/seed'

console.log('🌱 Iniciando seed...')
seedIfNeeded()
  .then(() => {
    console.log('✅ Seed completado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Falha ao executar seed:', error)
    process.exit(1)
  })
