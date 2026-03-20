import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: El ID auto-generado (UUID)
 *         name:
 *           type: string
 *           description: Nombre del producto
 *         description:
 *           type: string
 *           description: Descripción del producto
 *         category:
 *           type: string
 *         photo_url:
 *           type: string
 *         virtual_deposit:
 *           type: number
 *         rules:
 *           type: array
 *           items:
 *             type: string
 *         stock:
 *           type: integer
 *           description: Inventario disponible
 *         is_archived:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *       example:
 *         id: "c64fcbd4-190c-486d-a464-376eec5226c9"
 *         name: Ordenador
 *         description: Ordenador to wapo
 *         category: Electronics
 *         photo_url: https://tuservidor.com/images/ordenador.jpg
 *         virtual_deposit: 50
 *         rules: ["Devolver con la pantalla limpia", "No instalar software sin permiso"]
 *         stock: 12
 *         is_archived: false
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API para gestionar el catálogo de productos
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtiene todos los productos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID (UUID) del producto
 *     responses:
 *       200:
 *         description: Detalles del producto devueltos con éxito
 *       404:
 *         description: Producto no encontrado
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crea un nuevo producto
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               photo_url:
 *                 type: string
 *               virtual_deposit:
 *                 type: number
 *               rules:
 *                 type: array
 *                 items:
 *                   type: string
 *               stock:
 *                 type: integer
 *               is_archived:
 *                 type: boolean
 *           example:
 *             name: Ordenador
 *             description: Ordenador to wapo
 *             category: Electronics
 *             photo_url: https://tuservidor.com/images/ordenador.jpg
 *             virtual_deposit: 50
 *             rules: ["Devolver con la pantalla limpia", "No instalar software sin permiso"]
 *             stock: 12
 *             is_archived: false
 *     responses:
 *       201:
 *         description: Producto creado en la base de datos
 */
router.post("/", createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualiza un producto existente
 *     tags: [Products]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               photo_url:
 *                 type: string
 *               virtual_deposit:
 *                 type: number
 *               rules:
 *                 type: array
 *                 items:
 *                   type: string
 *               stock:
 *                 type: integer
 *               is_archived:
 *                 type: boolean
 *           example:
 *             name: Ordenador Premium
 *             virtual_deposit: 60
 *             stock: 10
 *             is_archived: false
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       404:
 *         description: Producto no encontrado
 */
router.put("/:id", updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Elimina un producto de manera permanente
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       404:
 *         description: Producto no encontrado
 */
router.delete("/:id", deleteProduct);

export default router;
