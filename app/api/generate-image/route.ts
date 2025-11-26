import { NextResponse } from 'next/server';


const MODEL_NAME = "CompVis/stable-diffusion-v1-4";
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}`;

// Assurez-vous que HF_API_KEY est bien votre Jeton d'accès utilisateur Hugging Face
const HF_API_KEY = process.env.HF_API_KEY;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt manquant' }, { status: 400 });
    }

    if (!HF_API_KEY) {
      // Renvoie une erreur si la clé n'est pas chargée (pour le débogage)
      return NextResponse.json({ error: "La clé HF_API_KEY est manquante. Vérifiez .env.local et redémarrez." }, { status: 500 });
    }

    console.log(`Tentative d'accès GRATUIT à l'API Hugging Face. Modèle: ${MODEL_NAME}`);

    const response = await fetch(
      API_URL,
      {
        method: 'POST',
        headers: {
          // L'authentification est cruciale, même pour l'accès gratuit
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'image/png', // Demande une image binaire
        },
        body: JSON.stringify({
          inputs: prompt,
          options: {
            // ESSENTIEL pour l'API gratuite : attendre que le modèle charge
            wait_for_model: true,
            use_cache: false
          },
          parameters: {
            // Réduit le nombre d'étapes pour accélérer la génération gratuite (mais dégrade la qualité)
            num_inference_steps: 15,
            guidance_scale: 7.5,
          }
        }),
      }
    );

    if (!response.ok) {
      // Gère les erreurs de l'API (quota, indisponibilité, etc.)
      const errorText = await response.text();
      return NextResponse.json({
        error: `Erreur Hugging Face. Statut: ${response.status}. Message: ${errorText}`
      }, { status: response.status });
    }

    // --- L'API renvoie un binaire, nous le convertissons en Base64 ---
    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // Le frontend s'attend à 'image_url', nous renvoyons une Data URL
    const image_url = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ image_url });

  } catch (err) {
    console.error('Erreur lors du traitement de la requête:', err);
    return NextResponse.json({ error: 'Erreur serveur interne lors de l\'appel à l\'API' }, { status: 500 });
  }
}