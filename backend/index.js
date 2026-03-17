import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import { setupSwagger } from "./src/config/swagger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger
setupSwagger(app);

// Routes
app.get("/", (req, res) => {
  res.send("Backend de ShareIt funcionando con Supabase y Swagger! 🚀");
});

app.use("/auth", authRoutes);

// Error handling middleware (Good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal!" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
});
