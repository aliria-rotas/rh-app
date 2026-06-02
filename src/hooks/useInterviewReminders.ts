import { useEffect, useRef } from 'react'
import { dbCandidates, dbJobOpenings } from '@/lib/db'
import type { Candidate, JobOpening } from '@/types'

export function useInterviewReminders() {
  const notifiedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const checkInterviews = async () => {
      try {
        // Buscar todas as vagas
        const jobs = await dbJobOpenings.list()
        if (!jobs.length) return

        // Buscar candidatos de todas as vagas
        const allCandidates: Candidate[] = []
        for (const job of jobs) {
          const candidates = await dbCandidates.listByJob(job.id)
          allCandidates.push(...candidates)
        }

        // Verificar entrevistas nos próximos 15 minutos
        const now = new Date()
        const in15Minutes = new Date(now.getTime() + 15 * 60000)

        for (const candidate of allCandidates) {
          if (!candidate.interview_date || !candidate.interview_time) continue

          // Montar a data e hora da entrevista
          const [year, month, day] = candidate.interview_date.split('-')
          const [hours, minutes] = candidate.interview_time.split(':')
          const interviewTime = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours),
            parseInt(minutes)
          )

          // Verificar se a entrevista é nos próximos 15 minutos
          const timeDiff = interviewTime.getTime() - now.getTime()
          const minutesUntilInterview = Math.floor(timeDiff / 60000)

          // Se faltam entre 0 e 15 minutos E ainda não notificamos
          if (minutesUntilInterview >= 0 && minutesUntilInterview <= 15) {
            const notificationKey = `${candidate.id}-${candidate.interview_date}-${candidate.interview_time}`

            if (!notifiedRef.current.has(notificationKey)) {
              notifiedRef.current.add(notificationKey)

              // Disparar notificação
              const message = `Entrevista de ${candidate.name} em ${minutesUntilInterview} minutos às ${candidate.interview_time}`

              // Notificação visual no navegador
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🔔 Lembrete de Entrevista', {
                  body: message,
                  icon: '/favicon.svg',
                })
              }

              // Alerta de fallback
            }
          }

          // Limpar notificações antigas (depois de 1 hora da entrevista)
          if (timeDiff < -3600000) {
            const notificationKey = `${candidate.id}-${candidate.interview_date}-${candidate.interview_time}`
            notifiedRef.current.delete(notificationKey)
          }
        }
      } catch (error) {
      }
    }

    // Pedir permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Verificar a cada minuto
    const interval = setInterval(checkInterviews, 60000)

    // Verificar imediatamente ao iniciar
    checkInterviews()

    return () => clearInterval(interval)
  }, [])
}
