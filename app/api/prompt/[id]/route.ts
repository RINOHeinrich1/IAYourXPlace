// app/api/prompt/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 14+ : params est une Promise, il faut l'attendre
    const { id: promptId } = await params;
    
    if (!promptId) {
      return NextResponse.json(
        { 
          type: "https://example.com/errors/bad-request",
          title: "Bad Request",
          status: 400,
          detail: "ID de prompt requis",
          instance: request.url
        },
        { status: 400 }
      );
    }

    // Récupération des variables d'environnement
    const token = process.env.ALIVEAI_TOKEN;
    const serverId = process.env.SERVER_ID || 'r9orK';
    
    if (!token) {
      return NextResponse.json(
        {
          type: "https://example.com/errors/server-error",
          title: "Server Error",
          status: 500,
          detail: "Configuration serveur incomplète",
          instance: request.url
        },
        { status: 500 }
      );
    }

    console.log(`🔍 Récupération du prompt ${promptId}`);

    // Appel à l'API AliveAI pour récupérer le prompt
    const response = await fetch(`https://api.aliveai.app/prompts/${promptId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-server-id': serverId,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur AliveAI (${response.status}):`, errorText);
      
      return NextResponse.json(
        { 
          type: "https://example.com/errors/not-found",
          title: "Not Found",
          status: response.status,
          detail: `Prompt ${promptId} non trouvé`,
          instance: request.url
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Prompt ${promptId} récupéré avec succès`);
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ Erreur récupération prompt:", error);
    
    return NextResponse.json(
      {
        type: "https://example.com/errors/server-error",
        title: "Internal Server Error",
        status: 500,
        detail: "Erreur lors de la récupération du prompt",
        instance: request.url,
        ...(process.env.NODE_ENV === 'development' && { 
          message: error.message 
        })
      },
      { status: 500 }
    );
  }
}