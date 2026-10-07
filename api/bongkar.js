export default async function handler(request) {
    if (request.method !== "POST") {
        return new Response(
            JSON.stringify({
                ok: false,
                error: "Method Not Allowed"
            }),
            {
                status: 405,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    try {
        const formData = await request.formData();

        const photo = formData.get("photo");
        const caption = formData.get("caption");

        if (!photo) {
            return new Response(
                JSON.stringify({
                    ok: false,
                    error: "Photo tidak ditemukan"
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const TELEGRAM_BOT_TOKEN =
            process.env.TELEGRAM_BOT_TOKEN;

        const TELEGRAM_CHAT_ID =
            process.env.TELEGRAM_CHAT_ID;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            return new Response(
                JSON.stringify({
                    ok: false,
                    error: "Telegram environment variable belum dikonfigurasi"
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const telegramForm = new FormData();

        telegramForm.append(
            "chat_id",
            TELEGRAM_CHAT_ID
        );

        telegramForm.append(
            "photo",
            photo,
            photo.name || "bukti.jpg"
        );

        telegramForm.append(
            "caption",
            caption || ""
        );

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
            {
                method: "POST",
                body: telegramForm
            }
        );

        const telegramResult =
            await telegramResponse.json();

        if (!telegramResponse.ok || !telegramResult.ok) {
            return new Response(
                JSON.stringify({
                    ok: false,
                    error:
                        telegramResult.description ||
                        "Telegram gagal mengirim foto"
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        return new Response(
            JSON.stringify({
                ok: true
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {

        console.error(
            "BONGKAR API ERROR:",
            error
        );

        return new Response(
            JSON.stringify({
                ok: false,
                error: "Terjadi kesalahan pada server"
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}
