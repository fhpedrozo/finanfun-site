/**
 * Vercel Serverless Function - API Route
 * Arquivo: /api/contact.js
 * 
 * Intermediário entre frontend (Vercel) e backend (Hostinger/WordPress)
 * Resolve problema de CORS e firewall
 */

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Responder OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Método não permitido' 
        });
    }

    try {
        // Obter dados do body
        const { name, email, subject, message } = req.body;

        // Validar dados
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Dados incompletos' 
            });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'E-mail inválido' 
            });
        }

        console.log('📧 Enviando para WordPress:', { name, email, subject });

        // Fazer requisição para o endpoint PHP na Hostinger
        const response = await fetch('https://finanfun.com.br/process-contact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-Serverless-Function/1.0'
            },
            body: JSON.stringify({
                name,
                email,
                subject,
                message
            })
        });

        console.log('📥 Resposta do WordPress:', response.status);

        // Processar resposta
        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ Sucesso!');
            return res.status(200).json({
                success: true,
                message: data.message || 'Mensagem enviada com sucesso!'
            });
        } else {
            console.log('❌ Erro do WordPress:', data);
            return res.status(500).json({
                success: false,
                message: data.message || 'Erro ao enviar mensagem'
            });
        }

    } catch (error) {
        console.error('❌ Erro na API Route:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao processar requisição'
        });
    }
}
