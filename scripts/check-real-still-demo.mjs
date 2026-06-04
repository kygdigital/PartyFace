import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";

const appUrl = process.env.PARTYFACE_APP_URL ?? "http://localhost:3001";
const imagePaths = process.argv.slice(2).filter(Boolean).slice(0, 2);

if (imagePaths.length === 0) {
  console.error(
    "Usage: npm run demo:real-still -- /absolute/path/person-1.jpg [/absolute/path/person-2.jpg]",
  );
  process.exit(1);
}

const subjects = await Promise.all(
  imagePaths.map(async (imagePath, index) => {
    const buffer = await readFile(imagePath);
    const mimeType = mimeTypeForPath(imagePath);

    return {
      slotId: index === 0 ? "person-1" : "person-2",
      label: `Person ${index + 1}`,
      optional: index > 0,
      photo: {
        fileName: basename(imagePath),
        mimeType,
        sizeBytes: buffer.byteLength,
        uploadRef: `data:${mimeType};base64,${buffer.toString("base64")}`,
        referenceRole: "face-reference",
      },
    };
  }),
);

const generationResponse = await fetch(`${appUrl}/api/generate/still`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    template: {
      id: "disco-glam",
      name: "Disco Glam",
      birthdayVibe: "disco glam",
    },
    generationStyle: {
      id: "cutout-heads",
      name: "Cutout Heads",
      promptInstruction:
        "Generation style: Cutout Heads. Use the uploaded faces as clearly visible oversized photographic cutout heads pasted onto generated bodies. Keep the faces recognizable and intentionally not fully blended: crisp cutout edges, thin white sticker outline, subtle drop shadow, slightly exaggerated head scale, and playful collage proportions.",
    },
    storyTemplate: {
      id: "disco-birthday-entrance",
      name: "Disco Birthday Entrance",
      musicMood: "Upbeat disco-funk with a clear chorus drop near the final reveal.",
      generationGuidance:
        "Build a 30-second disco birthday arc with mirrorball lighting, playful dancing, confetti, and readable neon birthday callouts.",
      beats: [
        {
          id: "entrance",
          timeRange: "0-6s",
          title: "Neon Invite",
          caption: "The party doors open for Demo Friend.",
          visualDirection:
            "Disco lights wake up, crowd silhouettes turn, mirrorball sparkles.",
        },
        {
          id: "arrival",
          timeRange: "6-13s",
          title: "Icon Arrival",
          caption: "Demo Friend enters like the main event.",
          visualDirection:
            "Cutout face on glam outfit, camera push, paparazzi-style flashes.",
        },
        {
          id: "dance",
          timeRange: "13-23s",
          title: "Premium Moves",
          caption: "Still iconic. Still premium.",
          visualDirection: "Two or three dance poses, glitter trails, animated text beats.",
        },
        {
          id: "finale",
          timeRange: "23-30s",
          title: "Birthday Drop",
          caption: "Happy Birthday, Demo Friend!",
          visualDirection: "Confetti, cake reveal, crowd cheer, big neon birthday title.",
        },
      ],
    },
    birthdayDetails: {
      recipientName: "Demo Friend",
      age: "41",
      message: "Happy birthday, premium edition",
      tone: "playful",
    },
    prompt:
      "Create a polished disco-glam birthday poster with the uploaded face reference, neon pink and gold lighting, readable headline text, a mirrorball dancefloor, and premium party energy.",
    subjects,
  }),
});

const generationResult = await generationResponse.json();

if (!generationResult.ok) {
  console.error(JSON.stringify(generationResult, null, 2));
  process.exit(1);
}

const jobId = generationResult.data.jobId;
console.log(`Submitted PartyFace still job ${jobId}.`);

for (let attempt = 1; attempt <= 90; attempt += 1) {
  await wait(2_000);

  const jobResponse = await fetch(`${appUrl}/api/jobs/${jobId}`);
  const jobResult = await jobResponse.json();

  if (!jobResult.ok) {
    console.error(JSON.stringify(jobResult, null, 2));
    process.exit(1);
  }

  console.log(`Attempt ${attempt}: ${jobResult.data.status}`);

  if (jobResult.data.status === "complete") {
    console.log(JSON.stringify(jobResult.data.outputs ?? [], null, 2));
    process.exit(jobResult.data.outputs?.length ? 0 : 1);
  }

  if (jobResult.data.status === "failed") {
    console.error(JSON.stringify(jobResult.data, null, 2));
    process.exit(1);
  }
}

console.error("Timed out waiting for real still outputs.");
process.exit(1);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mimeTypeForPath(path) {
  switch (extname(path).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
}
