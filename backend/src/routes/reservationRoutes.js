import express from "express";
import {
  createReservation,
  getUserReservations,
  deleteReservation,
  getAllReservations,
} from "../controllers/reservationController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       required:
 *         - resource_id
 *         - date
 *         - start_time
 *         - end_time
 *       properties:
 *         reservation_id:
 *           type: string
 *           description: El ID auto-generado
 *         resource_id:
 *           type: string
 *         user_id:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         start_time:
 *           type: string
 *           format: time
 *         end_time:
 *           type: string
 *           format: time
 */

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: API para usuarios apartar espacios físicos, debe de enviarse el access_token o haber sesión activa mediante cookies.
 */

// Estas rutas están protegidas
router.use(requireAuth);

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Crea una nueva reserva
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resource_id:
 *                 type: string
 *               date:
 *                 type: string
 *                 example: "2024-03-25"
 *               start_time:
 *                 type: string
 *                 example: "10:00:00"
 *               end_time:
 *                 type: string
 *                 example: "12:00:00"
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Solapamiento de horarios o campos faltantes
 */
router.post("/", createReservation);

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Obtiene todas las reservas (para admin)
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: Lista de todas las reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 */
router.get("/", getAllReservations);

/**
 * @swagger
 * /reservations/me:
 *   get:
 *     summary: Obtiene las reservas del usuario autenticado
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: Lista de las reservas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 */
router.get("/me", getUserReservations);

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     summary: Cancela una reserva del usuario
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva cancelada exitosamente
 *       403:
 *         description: No tienes permiso
 *       404:
 *         description: Reserva no encontrada
 */
router.delete("/:id", deleteReservation);

export default router;
