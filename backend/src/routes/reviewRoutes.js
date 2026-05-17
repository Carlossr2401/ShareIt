import express from "express";
import {
  createReview,
  getReviewsByTarget,
  getReviewsByReservation,
  uploadImages
} from "../controllers/reviewController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API para gestionar las reseñas y valoraciones
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Crear una nueva reseña
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               reservation_id:
 *                 type: string
 *               target_id:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *               role:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 */
router.post("/", requireAuth, uploadImages, createReview);

/**
 * @swagger
 * /reviews/target/{targetId}:
 *   get:
 *     summary: Obtener todas las reseñas recibidas por un usuario
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de reseñas
 */
router.get("/target/:targetId", getReviewsByTarget);

/**
 * @swagger
 * /reviews/reservation/{reservationId}:
 *   get:
 *     summary: Obtener las reseñas asociadas a una reserva
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de reseñas
 */
router.get("/reservation/:reservationId", getReviewsByReservation);

export default router;
