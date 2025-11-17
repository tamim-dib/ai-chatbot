const express = require("express");
const fetch = require("node-fetch");

const GEMINI_API_KEY = "AIzaSyBnCGbG3f3hyGTUWbQ4TXOfC1PELLTAbHM"; // ضع المفتاح الجديد هنا

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/chat", async (req, res) => {
  try {
    console.log("📩 استلام الرسالة:", req.body.message);
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "الرجاء إدخال رسالة" });
    }

    console.log("🔄 الاتصال بـ Gemini API...");

    // استخدام الموديل: gemini-1.5-flash (أفضل وأخف)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `أنت مساعد ذكي. أجب باللغة العربية بشكل واضح ومفيد.\n\nسؤال المستخدم: ${userMessage}`
                }
              ]
            }
          ]
        }),
      }
    );

    const data = await response.json();
    console.log("📥 استجابة Gemini:", JSON.stringify(data, null, 2));

    // معالجة الأخطاء من API
    if (data.error) {
      console.error("❌ خطأ من Gemini:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    // استخراج الرد من الاستجابة
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "لم يتم الحصول على رد من الذكاء الاصطناعي.";

    console.log("✅ الرد جاهز");
    res.json({ reply });

  } catch (error) {
    console.error("❌ خطأ بالسيرفر:", error);
    res.status(500).json({ error: "حدث خطأ: " + error.message });
  }
});

// مسارات غير موجودة
app.use((req, res) => {
  res.status(404).json({ error: "الصفحة غير موجودة" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`);
  console.log(`📝 افتح http://localhost:${PORT}/chatbot.html`);
});
