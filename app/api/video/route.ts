import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role obligatoire pour insert
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      vetementsIds,
      actionsIds,
      posesIds,
      accessoiresIds,
      scenesIds,
      videoUrl,
      description // 🔹 Nouveau champ pour le textarea
    } = body;

    // Vérification minimale
    if (!videoUrl) {
      return NextResponse.json(
        { error: "videoUrl est obligatoire" },
        { status: 400 }
      );
    }

    // Insertion Supabase
    const { data, error } = await supabase
      .from("video_generations")
      .insert({
        user_id: userId || null,
        vetements_ids: vetementsIds || [],
        actions_ids: actionsIds || [],
        poses_ids: posesIds || [],
        accessoires_ids: accessoiresIds || [],
        scenes_ids: scenesIds || [],
        video_url: videoUrl,
        description: description || "" // 🔹 insertion du texte
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
