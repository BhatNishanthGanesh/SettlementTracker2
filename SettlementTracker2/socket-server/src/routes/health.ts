import { Router } from "express";

const router = Router();

router.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Socket server is running",
  });
});

export default router;