import express from "express";
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  addAvailability,
  removeAvailability
} from "../controllers/resourceController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         resource_id:
 *           type: string
 *           description: El ID auto-generado
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         photo_url:
 *           type: string
 *         rules:
 *           type: array
 *           items:
 *             type: string
 *         deposit:
 *           type: number
 *         category:
 *           type: string
 *         is_archived:
 *           type: boolean
 *         availabilities:
 *           type: array
 *           description: Una lista opcional de horarios al crear el recurso.
 *           items:
 *             type: object
 *             properties:
 *               day_of_week:
 *                 type: integer
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "18:00:00"
 *     Availability:
 *       type: object
 *       required:
 *         - day_of_week
 *         - start_time
 *         - end_time
 *       properties:
 *         availability_id:
 *           type: string
 *         resource_id:
 *           type: string
 *         day_of_week:
 *           type: integer
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
 *   name: Resources
 *   description: API para gestionar o administrar recursos y sus disponibilidades de horario
 */

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Obtiene todos los recursos
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: Lista de recursos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
router.get("/", getResources);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Obtiene un recurso por su ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del recurso
 *       404:
 *         description: Recurso no encontrado
 */
router.get("/:id", getResourceById);

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Crea un nuevo recurso
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Resource'
 *     responses:
 *       201:
 *         description: Recurso creado
 */
router.post("/", createResource);

/**
 * @swagger
 * /resources/{id}:
 *   put:
 *     summary: Actualiza un recurso
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Resource'
 *     responses:
 *       200:
 *         description: Recurso actualizado
 */
router.put("/:id", updateResource);

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Elimina un recurso
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recurso eliminado
 */
router.delete("/:id", deleteResource);

/**
 * @swagger
 * /resources/{id}/availabilities:
 *   post:
 *     summary: Añade un horario de disponibilidad a un recurso
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day_of_week:
 *                 type: integer
 *               start_time:
 *                 type: string
 *                 example: "09:00:00"
 *               end_time:
 *                 type: string
 *                 example: "18:00:00"
 *     responses:
 *       201:
 *         description: Disponibilidad añadida
 */
router.post("/:id/availabilities", addAvailability);

/**
 * @swagger
 * /resources/availabilities/{availability_id}:
 *   delete:
 *     summary: Elimina una disponibilidad
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: availability_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Disponibilidad eliminada
 */
router.delete("/availabilities/:availability_id", removeAvailability);

export default router;
