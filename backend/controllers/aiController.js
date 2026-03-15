const OpenAI = require('openai');

const allowedGenders = ['Boy', 'Girl', 'Unisex'];
const fallbackMeanings = [
  'Radiant and graceful',
  'Beloved and kind',
  'Calm and peaceful spirit',
  'Bright and joyful',
  'Strong and noble',
  'Wise and thoughtful',
  'Pure and gentle',
  'Prosperous and fortunate',
  'Courageous and compassionate',
  'Harmonious and serene',
];

function extractJsonArray(text) {
  const trimmed = text.trim();

  if (trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch) {
    const candidate = codeBlockMatch[1].trim();
    if (candidate.startsWith('[')) {
      return JSON.parse(candidate);
    }
  }

  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
  }

  throw new Error('AI response did not include a JSON array.');
}

function capitalize(value) {
  if (!value) {
    return '';
  }

  return value[0].toUpperCase() + value.slice(1).toLowerCase();
}

function generateFallbackNames(fatherName, motherName, gender) {
  const father = String(fatherName || '').trim().toLowerCase();
  const mother = String(motherName || '').trim().toLowerCase();

  if (!father || !mother) {
    return [];
  }

  const f1 = father.slice(0, Math.max(2, Math.ceil(father.length / 2)));
  const f2 = father.slice(Math.floor(father.length / 2));
  const m1 = mother.slice(0, Math.max(2, Math.ceil(mother.length / 2)));
  const m2 = mother.slice(Math.floor(mother.length / 2));

  const base = [
    f1 + m2,
    m1 + f2,
    f1 + mother.slice(-2),
    m1 + father.slice(-2),
    father[0] + m1 + mother.slice(-1),
    mother[0] + f1 + father.slice(-1),
    f2 + m2,
    m2 + f2,
    f1 + m1,
    m2 + father[0],
    mother[0] + f2,
    father[0] + m2,
  ];

  const uniqueNames = Array.from(
    new Set(base.map((name) => capitalize(name.replace(/[^a-z]/gi, ''))).filter((name) => name.length >= 4)),
  ).slice(0, 10);

  return uniqueNames.map((name, index) => ({
    name,
    meaning: fallbackMeanings[index % fallbackMeanings.length],
    gender,
  }));
}

async function generateName(req, res) {
  let fatherName = '';
  let motherName = '';
  let gender = '';

  try {
    ({ fatherName, motherName, gender } = req.body || {});

    if (!fatherName || !motherName || !gender) {
      return res.status(400).json({
        message: 'fatherName, motherName, and gender are required.',
      });
    }

    if (!allowedGenders.includes(gender)) {
      return res.status(400).json({
        message: `gender must be one of: ${allowedGenders.join(', ')}`,
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: 'OPENAI_API_KEY is not configured on the backend.',
      });
    }

    const client = new OpenAI({ apiKey });

    const prompt = `Generate 10 unique baby names using the following information.\n\nFather name: ${fatherName}\nMother name: ${motherName}\nPreferred gender: ${gender}\n\nRules:\n\n- Use parts of both parent names\n- Names should sound natural\n- Prefer Indian or Sanskrit-style names\n- Each name must include a short meaning\n- Avoid duplicate names\n\nReturn the result strictly in JSON format:\n\n[\n  {\n    \"name\": \"Riyaan\",\n    \"meaning\": \"Melodious and graceful\",\n    \"gender\": \"${gender}\"\n  },\n  {\n    \"name\": \"Priyav\",\n    \"meaning\": \"Beloved and kind\",\n    \"gender\": \"${gender}\"\n  }\n]`;

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You generate culturally natural baby names and always return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.9,
      });
    } catch (_modelError) {
      const fallback = generateFallbackNames(fatherName, motherName, gender);
      if (fallback.length > 0) {
        return res.status(200).json(fallback);
      }

      return res.status(502).json({ message: 'Failed to generate names from AI model.' });
    }

    const raw = completion.choices?.[0]?.message?.content;
    if (!raw) {
      return res.status(502).json({ message: 'Empty response from AI model.' });
    }

    let parsed = extractJsonArray(raw);

    if (!Array.isArray(parsed)) {
      return res.status(502).json({ message: 'Invalid AI response format.' });
    }

    const unique = new Map();
    for (const item of parsed) {
      if (!item?.name || !item?.meaning) {
        continue;
      }

      const normalizedName = String(item.name).trim();
      if (!normalizedName) {
        continue;
      }

      unique.set(normalizedName.toLowerCase(), {
        name: normalizedName,
        meaning: String(item.meaning).trim(),
        gender: item.gender || gender,
      });
    }

    parsed = Array.from(unique.values()).slice(0, 10);

    return res.status(200).json(parsed);
  } catch (error) {
    const fallback = generateFallbackNames(fatherName, motherName, gender || 'Unisex');
    if (fallback.length > 0) {
      return res.status(200).json(fallback);
    }

    return res.status(500).json({
      message: 'Failed to generate AI baby names.',
      error: error.message,
    });
  }
}

module.exports = {
  generateName,
};
