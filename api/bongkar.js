import formidable from "formidable";
import fs from "fs";

export const config = {
    api: {
        bodyParser: false
    }
};

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            ok: false,
            error: "Method Not Allowed"
        });
    }

    try {

        const form = formidable({
            multiples: false
        });

        const [fields, files] = await form.parse(req);

        const photo = Array.isArray(files.photo)
            ? files.photo[0]
            : files.photo;

        const caption = Array.isArray(fields.caption)
            ? fields.caption[0]
            : fields.caption || "";

        if (!photo) {
            return res.status(400).json({
                ok: false,
                error: "Photo tidak ditemukan"
            });
        }

        const botToken =
            process.env.TELEGRAM_BOT_TOKEN;

        const chatId =
            process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.error(
                "Telegram environment variable belum tersedia"
            );

            return res.status(500).json({
                ok: false,
                error: "Telegram configuration belum tersedia"
            });
        }

        const telegramForm = new FormData();

        telegramForm.append(
            "chat_id",
            chatId
        );

        telegramForm.append(
            "caption",
            caption
        );

        const buffer = fs.readFileSync(
            photo.filepath
        );

        const blob = new Blob(
            [buffer],
            {
                type: photo.mimetype || "image/jpeg"
            }
        );

        telegramForm.append(
            "photo",
            blob,
            photo.originalFilename || "bukti.jpg"
        );

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/sendPhoto`,
            {
                method: "POST",
                body: telegramForm
            }
        );

        const telegramResult =
            await telegramResponse.json();

        console.log(
            "Telegram response:",
            telegramResult
        );

        if (
            !telegramResponse.ok ||
            !telegramResult.ok
        ) {
            return res.status(500).json({
                ok: false,
                error:
                    telegramResult.description ||
                    "Telegram gagal mengirim foto"
            });
        }

        return res.status(200).json({
            ok: true
        });

    } catch (error) {

        console.error(
            "BONGKAR API ERROR:",
            error
        );

        return res.status(500).json({
            ok: false,
            error: "Terjadi kesalahan pada server"
        });
    }
}
