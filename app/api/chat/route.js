
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

const MODEL_NAME = "gemini-2.5-flash";

export async function POST(request) {
  const { messages, generateImage } = await request.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'La clé GEMINI_API_KEY est manquante.' },
      { status: 500 }
    );
  }

  // Préfixe "copine IA"
  const introMessage = {
    role: 'user',
    parts: [{ text: "Tu es une IA amicale et proche de l'utilisateur, réponds doucement avec emojis 😄💕." }]
  };

  const contents = [introMessage, ...messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }))];

  try {
    if (generateImage) {
      // --- Génération d'image ---
      const prompt = messages[messages.length - 1]?.content || "Un dessin mignon style cartoon";

      const imageResponse = await ai.images.generateImage({
        prompt,
        size: "1024x1024",
        n: 1
      });

      return NextResponse.json({
        type: "image",
        url: imageResponse[0]?.uri || null
      });
    } else {
      // --- Génération de texte ---
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: contents,
        config: { temperature: 0.7 }
      });

      const assistantResponseText = response.text;
      if (!assistantResponseText) {
        return NextResponse.json({ error: "L'IA n'a pas pu générer de réponse." }, { status: 500 });
      }

      return NextResponse.json({
        type: "text",
        choices: [{
          message: { role: 'assistant', content: assistantResponseText }
        }]
      });
    }
  } catch (error) {
    console.error('Erreur avec l\'API Gemini:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur lors de l\'appel à Gemini.' },
      { status: 500 }
    );
  }
}

