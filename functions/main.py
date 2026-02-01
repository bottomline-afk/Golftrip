import io
import json
import traceback

from firebase_functions import https_fn
from firebase_functions.options import set_global_options
from firebase_functions.params import SecretParam
from firebase_admin import initialize_app, firestore, storage
from google import genai
from google.genai import types
from PIL import Image

set_global_options(max_instances=10)
initialize_app()

GEMINI_API_KEY = SecretParam("GEMINI_API_KEY")

AVATAR_STYLES = [
    {
        "id": "glossy-poster",
        "prompt": (
            "Create a high-energy golf avatar portrait based on my reference photo. "
            "Half-body, facing camera with a confident smile, wearing my golf hat and "
            "athletic hoodie. Stylize as a glossy sports poster / trading-card illustration: "
            "airbrushed highlights, subtle halftone texture, vibrant gradient background with "
            "diagonal light streaks, crisp rim lighting, and a faint vignette. Add a minimal "
            "badge shape behind the head and soft bokeh flares. No text, no dates, no explicit "
            "decade references. Ultra-clean edges, print-ready. 512x512."
        ),
    },
    {
        "id": "cinematic-chrome",
        "prompt": (
            "Generate a stylized golf avatar from my photo with bold, cinematic lighting. "
            "Use a vibrant teal-to-magenta gradient backdrop with soft glow and lens flare. "
            "Add airbrush-style shading and a slight halftone grain. Include chrome-like "
            "geometric accents (thin lines, triangles) and a subtle motion-streak pattern. "
            "Keep face likeness and hat shape recognizable. No words or numbers. Poster-like "
            "finish, high contrast, sharp. 512x512."
        ),
    },
    {
        "id": "airbrushed-print",
        "prompt": (
            "Turn my golf photo into an airbrushed illustration with smooth blended shading "
            "and glossy highlights, like a premium sports poster print. Warm skin tones, crisp "
            "eyes, slightly exaggerated clean contours. Background: luminous gradient with soft "
            "clouds of color and faint diagonal streaks. Add a subtle paper grain + halftone "
            "texture overlay. No text. Clean composition, centered subject. 512x512."
        ),
    },
    {
        "id": "heroic-dramatic",
        "prompt": (
            "Create a dynamic golf avatar from my photo with a heroic poster composition: "
            "slightly low camera angle, strong rim light, dramatic gradient backdrop with "
            "light beams and mild fog. Airbrushed highlights, halftone grain, subtle vignette. "
            "Keep outfit and hat, enhance athletic silhouette. No text, no logos, no dates. "
            "512x512."
        ),
    },
    {
        "id": "cartoon-sitcom",
        "prompt": (
            "512x512. Create a golf avatar based on my reference photo. Stylize as a bright, "
            "prime-time cartoon sitcom character: warm yellow-toned skin, bold clean outlines, "
            "simplified facial features, slightly enlarged eyes, soft cel shading, minimal "
            "texture. Keep my recognizable smile and hat silhouette. Background: simple pastel "
            "gradient with a few minimal shapes. No text, no logos, no brand marks. Crisp "
            "vector-like finish."
        ),
    },
    {
        "id": "paper-cutout",
        "prompt": (
            "512x512. Turn my reference photo into a comedic cutout-paper style avatar: very "
            "simple rounded shapes, flat colors, minimal shading, thick black outlines, small "
            "dot eyes, and a simplified mouth expression that still resembles my smile. Keep "
            "the hat and hoodie as simplified blocks of color. Background: flat solid color "
            "with a subtle paper texture. No text, no logos."
        ),
    },
    {
        "id": "game-select",
        "prompt": (
            '512x512. Create a stylized "character select" golf avatar from my reference '
            "photo: dynamic three-quarter pose, confident grin, dramatic rim lighting, "
            "high-contrast shading, and painterly-but-clean edges. Add energetic motion "
            "streaks and a bold gradient background with subtle particle sparks. Keep facial "
            "likeness and hat shape recognizable. No text, no UI labels, no logos, no numbers. "
            "Polished game key-art look."
        ),
    },
]


@https_fn.on_request(
    memory=1024,
    timeout_sec=300,
    cors=True,
    secrets=[GEMINI_API_KEY],
)
def generate_avatars(req: https_fn.Request) -> https_fn.Response:
    """Generate 7 AI avatar styles from a base photo using Gemini."""
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)

    try:
        body = req.get_json(silent=True) or {}
        trip_id = body.get("tripId")
        player_id = body.get("playerId")

        if not trip_id or not player_id:
            return https_fn.Response(
                json.dumps({"error": "tripId and playerId required"}),
                status=400,
                content_type="application/json",
            )

        db = firestore.client()
        bucket = storage.bucket()
        trip_ref = db.collection("trips").document(trip_id)

        # Set status to generating
        trip_ref.update({f"players.{player_id}.avatarGenerationStatus": "generating"})

        # Download base photo from Storage
        base_blob = bucket.blob(f"avatars/{trip_id}/{player_id}/base.jpg")
        base_bytes = base_blob.download_as_bytes()

        # Initialize Gemini client
        client = genai.Client(api_key=GEMINI_API_KEY.value)

        generated_urls = {}
        errors = []

        for style in AVATAR_STYLES:
            style_id = style["id"]
            try:
                response = client.models.generate_content(
                    model="gemini-2.0-flash-preview-image-generation",
                    contents=[
                        types.Content(
                            parts=[
                                types.Part.from_bytes(
                                    data=base_bytes,
                                    mime_type="image/jpeg",
                                ),
                                types.Part.from_text(text=style["prompt"]),
                            ]
                        )
                    ],
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                    ),
                )

                # Extract generated image from response
                image_data = None
                if response.candidates:
                    for part in response.candidates[0].content.parts:
                        if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                            image_data = part.inline_data.data
                            break

                if not image_data:
                    errors.append(f"{style_id}: no image in response")
                    continue

                # Resize to 512x512 WebP using Pillow
                img = Image.open(io.BytesIO(image_data))
                img = img.resize((512, 512), Image.LANCZOS)
                webp_buffer = io.BytesIO()
                img.save(webp_buffer, format="WEBP", quality=85)
                webp_bytes = webp_buffer.getvalue()

                # Upload to Storage
                dest_blob = bucket.blob(f"avatars/{trip_id}/{player_id}/{style_id}.webp")
                dest_blob.upload_from_string(webp_bytes, content_type="image/webp")
                dest_blob.make_public()
                generated_urls[style_id] = dest_blob.public_url

            except Exception:
                errors.append(f"{style_id}: {traceback.format_exc()}")
                continue

        # Update Firestore with results
        if generated_urls:
            trip_ref.update(
                {
                    f"players.{player_id}.generatedAvatars": generated_urls,
                    f"players.{player_id}.avatarGenerationStatus": "complete",
                }
            )
        else:
            trip_ref.update(
                {f"players.{player_id}.avatarGenerationStatus": "error"}
            )

        return https_fn.Response(
            json.dumps(
                {
                    "success": len(generated_urls) > 0,
                    "generated": list(generated_urls.keys()),
                    "errors": errors,
                }
            ),
            status=200,
            content_type="application/json",
        )

    except Exception:
        # Try to set error status
        try:
            db = firestore.client()
            trip_ref = db.collection("trips").document(body.get("tripId", ""))
            trip_ref.update(
                {
                    f'players.{body.get("playerId", "")}.avatarGenerationStatus': "error"
                }
            )
        except Exception:
            pass

        return https_fn.Response(
            json.dumps({"error": traceback.format_exc()}),
            status=500,
            content_type="application/json",
        )
