import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/authRoutes.js";
import resourceRoutes from "./src/routes/resourceRoutes.js";
import reservationRoutes from "./src/routes/reservationRoutes.js";
import { setupSwagger } from "./src/config/swagger.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(
  cors({
    origin: 'http://localhost:5173', // Updated for new Vite port
    credentials: true, // Permitir envío de cookies
  }),
);
app.use(express.json());
app.use(cookieParser());

// Swagger
setupSwagger(app);

// Routes
app.get("/", (req, res) => {
  res.send("Backend de ShareIt funcionando con Supabase y Swagger! 🚀");
});

app.use("/auth", authRoutes);
app.use("/resources", resourceRoutes);
app.use("/reservations", reservationRoutes);

// Error handling middleware (Good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal!" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
});

