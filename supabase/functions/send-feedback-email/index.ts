import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.4.2/mod.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { feedbackId, type, title, message, senderName, senderEmail } = await req.json()

    // Configuração do Gmail SMTP
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: Deno.env.get("GMAIL_EMAIL"),
          password: Deno.env.get("GMAIL_PASSWORD"),
        },
      },
    })

    // Conecta e envia email
    await client.connect()

    const emailBody = `
Novo Feedback Recebido!

Tipo: ${type === 'reclamacao' ? '🚨 Reclamação' : type === 'sugestao' ? '💡 Sugestão' : '👏 Elogio'}
Título: ${title}
De: ${senderName} (${senderEmail})

Mensagem:
${message}

---
ID do Feedback: ${feedbackId}
Acesse o dashboard para responder: https://rhapp.aliria.com/reclamacoes
    `.trim()

    await client.send({
      from: Deno.env.get("GMAIL_EMAIL") || "",
      to: Deno.env.get("RECIPIENT_EMAIL") || "",
      subject: `[Feedback] ${title}`,
      content: emailBody,
    })

    await client.close()

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})
