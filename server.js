const express = require("express");
const fetch = require("node-fetch");

const GEMINI_API_KEY = "AIzaSyBVvFsm15GHE5kBmvjGDGfgG-USy4pc8cg";

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

    console.log("🔄 جاري الاتصال بـ Gemini API...");

    // جرّب gemini-2.0-flash-exp (موديل تجريبي مجاني)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `أنت مساعد صحي ذكي. أجب على الأسئلة الصحية باللغة العربية بشكل واضح ومفيد.\n\nسؤال المستخدم: ${userMessage}`
            }]
          }]
        }),
      }
    );

    const data = await response.json();
    console.log("📥 الاستجابة:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("❌ خطأ Gemini:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "لم يتم الحصول على رد.";

    console.log("✅ تم الإرسال بنجاح");
    res.json({ reply });

  } catch (error) {
    console.error("❌ خطأ السيرفر:", error);
    res.status(500).json({ error: "حدث خطأ: " + error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "الصفحة غير موجودة" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ السيرفر يعمل على http://localhost:${PORT}`);
  console.log(`📝 افتح http://localhost:${PORT}/chatbot.html`);
});