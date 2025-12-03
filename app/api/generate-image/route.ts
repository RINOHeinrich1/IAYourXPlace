import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!   // obligatoire pour INSERT sécurisé
  );
}

export async function POST(req: Request) {
  const supabase = getSupabaseClient();
  try {
    const body = await req.json();

    const {
      userId,
      vetementsIds,
      actionsIds,
      posesIds,
      accessoiresIds,
      scenesIds,
      imageUrl,
      imageCount
    } = body;

    // 🔥 Vérification minimale
    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl est obligatoire" },
        { status: 400 }
      );
    }

    // 🔥 Insertion Supabase
    const { data, error } = await supabase
      .from("image_generations")
      .insert({
        user_id: userId || null,

        vetements_ids: vetementsIds || [],
        actions_ids: actionsIds || [],
        poses_ids: posesIds || [],
        accessoires_ids: accessoiresIds || [],
        scenes_ids: scenesIds || [],

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
