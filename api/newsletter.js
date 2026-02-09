// API Route: /api/newsletter
// Deploy na Vercel para evitar CORS

export default async function handler(req, res) {
  // CORS headers PRIMEIRO (antes de qualquer outra coisa)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight (OPTIONS request)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validação básica
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email inválido' 
      });
    }

    // Envia para o endpoint do Brevo
    const brevoUrl = 'https://057ec3c1.sibforms.com/serve/MUIFACp2rDm2qMkW3rMsWRc91lRWNugmQizIS9SMckLJ0OwkH4XJevYu5cKINQU-c1KHAxLrh43rW46JZWTcCMFL6vriLDSQpRPATUPXpgYjLvvS8myXNzmddqY997JTXc2e1KE9rHdi4EQxLxYfcawo6sfTwtzA0pj5z8wtLEs9ML9rb7W9ta6dF5vHQZ7SS1vTX2tb8KCzO2CLtg==';
    
    const formData = new URLSearchParams({
      'EMAIL': email,
      'email_address_check': '',
      'locale': 'pt'
    });

    const response = await fetch(brevoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    if (response.ok || response.status === 200) {
      // Sucesso!
      return res.status(200).json({ 
        success: true, 
        message: 'Você está cadastrado na nossa newsletter!' 
      });
    } else {
      // Erro do Brevo
      return res.status(500).json({ 
        success: false, 
        message: 'Ocorreu um erro ao tentar assinar. Tente novamente.' 
      });
    }

  } catch (error) {
    console.error('Newsletter error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Ocorreu um erro ao tentar assinar. Tente novamente.' 
    });
  }
}
