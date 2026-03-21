import { prisma } from "../config/prismaClient.js";

// Obtener todos los recursos con sus disponibilidades
export const getResources = async (req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        availabilities: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(resources);
  } catch (error) {
    console.error("Error al obtener recursos:", error);
    res.status(500).json({ error: "No se pudieron obtener los recursos" });
  }
};

// Obtener un recurso por ID
export const getResourceById = async (req, res) => {
  const { id } = req.params;
  try {
    const resource = await prisma.resource.findUnique({
      where: { resource_id: id },
      include: {
        availabilities: true,
        reservations: true
      }
    });
    
    if (!resource) {
      return res.status(404).json({ error: "Recurso no encontrado" });
    }
    
    res.json(resource);
  } catch (error) {
    console.error("Error al obtener el recurso:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear un nuevo recurso
export const createResource = async (req, res) => {
  const { name, description, location, photo_url, rules, deposit, category, availabilities } = req.body;

  if (!name) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  try {
    const newResource = await prisma.resource.create({
      data: {
        name,
        description,
        location,
        photo_url,
        rules: rules || [],
        deposit,
        category,
        availabilities: availabilities && availabilities.length > 0 ? {
          create: availabilities.map(av => ({
            day_of_week: av.day_of_week,
            start_time: new Date(`1970-01-01T${av.start_time}Z`),
            end_time: new Date(`1970-01-01T${av.end_time}Z`)
          }))
        } : undefined
      },
      include: {
        availabilities: true
      }
    });
    
    res.status(201).json(newResource);
  } catch (error) {
    console.error("Error al crear recurso:", error);
    res.status(500).json({ error: "No se pudo crear el recurso" });
  }
};

// Actualizar un recurso
export const updateResource = async (req, res) => {
  const { id } = req.params;
  const { name, description, location, photo_url, rules, deposit, category, is_archived } = req.body;

  try {
    const updatedResource = await prisma.resource.update({
      where: { resource_id: id },
      data: {
        name,
        description,
        location,
        photo_url,
        rules,
        deposit,
        category,
        is_archived
      }
    });

    res.json(updatedResource);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Recurso no encontrado" });
    }
    console.error("Error al actualizar recurso:", error);
    res.status(500).json({ error: "No se pudo actualizar el recurso" });
  }
};

// Eliminar un recurso
export const deleteResource = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.resource.delete({
      where: { resource_id: id }
    });

    res.json({ message: "Recurso eliminado exitosamente" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Recurso no encontrado" });
    }
    console.error("Error al eliminar recurso:", error);
    res.status(500).json({ error: "No se pudo eliminar el recurso" });
  }
};

// Añadir disponibilidad a un recurso
export const addAvailability = async (req, res) => {
  const { id } = req.params; // resource_id
  const { day_of_week, start_time, end_time } = req.body;

  if (day_of_week === undefined || !start_time || !end_time) {
    return res.status(400).json({ error: "day_of_week, start_time y end_time son obligatorios" });
  }

  try {
    const newAvailability = await prisma.availability.create({
      data: {
        resource_id: id,
        day_of_week,
        start_time: new Date(`1970-01-01T${start_time}Z`),
        end_time: new Date(`1970-01-01T${end_time}Z`)
      }
    });

    res.status(201).json(newAvailability);
  } catch (error) {
    console.error("Error al añadir disponibilidad:", error);
    res.status(500).json({ error: "No se pudo añadir la disponibilidad" });
  }
};

// Eliminar disponibilidad de un recurso
export const removeAvailability = async (req, res) => {
  const { availability_id } = req.params; 

  try {
    await prisma.availability.delete({
      where: { availability_id }
    });

    res.json({ message: "Disponibilidad eliminada exitosamente" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Disponibilidad no encontrada" });
    }
    console.error("Error al eliminar disponibilidad:", error);
    res.status(500).json({ error: "No se pudo eliminar la disponibilidad" });
  }
};
