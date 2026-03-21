import { prisma } from "../config/prismaClient.js";

// Obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "No se pudieron obtener los productos" });
  }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  const { name, description, category, photo_url, virtual_deposit, rules, stock, is_archived } = req.body;

  if (!name) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        category,
        photo_url,
        virtual_deposit,
        rules: rules || [],
        stock: stock || 0,
        is_archived: is_archived || false
      }
    });
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "No se pudo crear el producto" });
  }
};

// Actualizar un producto existente
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, photo_url, virtual_deposit, rules, stock, is_archived } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        category,
        photo_url,
        virtual_deposit,
        rules,
        stock,
        is_archived
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "No se pudo actualizar el producto" });
  }
};

// Eliminar un producto
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: "Producto eliminado existosamente" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "No se pudo eliminar el producto" });
  }
};
