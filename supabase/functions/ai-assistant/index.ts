
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      return Response.json(
        { error: "Thiếu OPENAI_API_KEY trong Supabase Secrets." },
        { status: 500, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const task = String(body.task ?? "").trim();
    const product = body.product ?? {};

    const prompts: Record<string, string> = {
      evaluate_product:
        "Đánh giá sản phẩm: ưu điểm, rủi ro, dữ liệu còn thiếu và kết luận. Không tự bịa số liệu.",
      create_content:
        "Viết 3 mẫu nội dung quảng bá sản phẩm bằng tiếng Việt. Không phóng đại công dụng.",
      campaign_ideas:
        "Đề xuất chiến dịch tiếp thị gồm đối tượng, thông điệp, 3 ý tưởng bài đăng và chỉ số theo dõi."
    };

    if (!prompts[task]) {
      return Response.json(
        { error: "Nhiệm vụ không hợp lệ." },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.4,
          messages: [
            {
              role: "system",
              content:
                "Bạn là AI của Affiliate AutoPilot. Trả lời bằng tiếng Việt. Chỉ sử dụng dữ liệu được cung cấp. Không bịa giá, hoa hồng, lượt bán hoặc cam kết thu nhập."
            },
            {
              role: "user",
              content:
                prompts[task] +
                "\n\nDữ liệu:\n" +
                JSON.stringify(product).slice(0, 12000)
            }
          ]
        })
      }
    );

    const data = await result.json();

    if (!result.ok) {
      return Response.json(
        { error: data?.error?.message ?? "OpenAI request failed" },
        { status: 502, headers: corsHeaders }
      );
    }

    return Response.json(
      {
        ok: true,
        task,
        output: data?.choices?.[0]?.message?.content ?? ""
      },
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
});
