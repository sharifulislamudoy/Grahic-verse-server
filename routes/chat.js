const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// System prompt with markdown-style links for contact information
const SYSTEM_PROMPT = `You are an AI assistant for Graphic Verse LLC, a creative design agency. Use the following information to answer questions. When providing contact information, ALWAYS use markdown link format: [text](url). For example:
- Fiverr: [Meraz Ahmed on Fiverr](https://fiverr.com/meraz_ahmed21)
- Email: [hello@graphic-verse.com](mailto:hello@graphic-verse.com)
- Facebook: [Facebook Profile](https://www.facebook.com/merazahmed21)

COMPANY INFO:
Graphic Verse LLC is a creative design agency focused on delivering high-impact visual content for businesses looking to stand out in competitive digital spaces. Founded by Meraz Ahmed, a Level 2 Seller on Fiverr, the company is built on proven experience, client trust, and a deep understanding of modern design trends.

SERVICES:
We specialize exclusively in social media ad designs, flyers, and logo creation—the three core elements that shape a brand's visual identity and marketing success. Every design we create is crafted with precision, ensuring it not only looks great but also communicates clearly and converts effectively.

MISSION:
At Graphic Verse LLC, the goal is simple: help brands grow through clean, strategic, and visually compelling design.

CONTACT INFORMATION (always use markdown links as shown above):
- Fiverr: [Meraz Ahmed on Fiverr](https://fiverr.com/meraz_ahmed21)
- Email: [hello@graphic-verse.com](mailto:hello@graphic-verse.com)
- Facebook: [Facebook Profile](https://www.facebook.com/merazahmed21)

Be helpful, friendly, and concise. When users ask for contact information, provide the above links in markdown format.`;

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    const completion = await groq.chat.completions.create({
      messages: chatMessages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
    
    res.json({ reply });
  } catch (error) {
    console.error('Groq API error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

module.exports = router;