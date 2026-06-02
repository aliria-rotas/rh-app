import { seedIfNeeded } from './src/lib/seed.ts'

console.log('🌱 Starting seed...')
seedIfNeeded()
  .then(() => {
    console.log('✅ Seed completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
