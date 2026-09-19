import { Router } from "express";
import { Server } from "socket.io";

export function createBroadcastRouter(io: Server) {
    const router = Router();

    router.post("/message", (req, res) => {

    const { tripId, message } = req.body;

    if (!tripId || !message) {
        return res.status(400).json({
            success: false,
            error: "tripId and message are required",
        });
    }

    const socketMessage = {
        ...message,
        tripId,
    };

    io.to(tripId).emit("message", socketMessage);

    return res.json({
        success: true,
    });
});

    router.post("/edit-message", (req, res) => {
        const { tripId, message } = req.body;

        if (!tripId || !message) {
            return res.status(400).json({
                success: false,
                error: "tripId and message are required",
            });
        }

        io.to(tripId).emit("edit-message", message);

        return res.json({
            success: true,
        });
    });

    router.post("/delete-message", (req, res) => {
        const { tripId, messageId } = req.body;

        if (!tripId || !messageId) {
            return res.status(400).json({
                success: false,
                error: "tripId and messageId are required",
            });
        }

        io.to(tripId).emit("delete-message", {
            tripId,
            messageId,
        });

        return res.json({
            success: true,
        });
    });
    return router;
}