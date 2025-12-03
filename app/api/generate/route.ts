import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 🔹 Création du client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // nécessaire pour INSERT sécurisé
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      vetements,    // 🔹 labels, pas IDs
      actions,
      poses,
      accessoires,
      scenes,
      imageUrl,
      imageCount
    } = body;

    // Vérification minimale
    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl est obligatoire" },
        { status: 400 }
      );
    }

    // 🔹 Insertion dans Supabase avec les noms corrects
    const { data, error } = await supabase
      .from("image_generations")
      .insert({
        user_id: userId || null,
        vetements_names: vetements || [],
        actions_names: actions || [],
        poses_names: poses || [],
        accessoires_names: accessoires || [],
        scenes_names: scenes || [],
        image_url: imageUrl,
        image_count: imageCount || 1
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Erreur serveur: " + err.message },
      { status: 500 }
    );
  }
}
