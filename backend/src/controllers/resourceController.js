import { prisma } from "../config/prismaClient.js";
import { supabase } from "../config/supabaseClient.js";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });
export const uploadImages = upload.array("images", 10);

// Obtener todos los recursos con sus disponibilidades
export const getResources = async (req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        availabilities: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(resources);
  } catch (error) {
    console.error("Error al obtener recursos:", error);
    res.status(500).json({ error: "No se pudieron obtener los recursos" });
  }
};

// Obtener los recursos subidos por el usuario actual
export const getMyResources = async (req, res) => {
  const user_id = req.user.id;
  try {
    const resources = await prisma.resource.findMany({
      where: { ownerId: user_id },
      include: { availabilities: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(resources);
  } catch (error) {
    console.error("Error al obtener mis recursos:", error);
    res.status(500).json({ error: "No se pudieron obtener tus recursos" });
  }
};

// Obtener un recurso por ID
export const getResourceById = async (req, res) => {
  const { id } = req.params;
  try {
    const resource = await prisma.resource.findUnique({
      where: { resourceId: id },
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

// Crear un nuevo recurso con soporte para imágenes
export const createResource = async (req, res) => {
  const { name, description, location, rules, deposit, category, availabilities } = req.body;
  const imageFile = req.file;

  if (!name) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  try {
    // 1. Parsear disponibilidades si vienen como JSON (en multipart vienen como string)
    let parsedAvailabilities = [];
    if (availabilities) {
      parsedAvailabilities = typeof availabilities === 'string' ? JSON.parse(availabilities) : availabilities;
    }

    // 2. Crear el recurso en la DB (primero para tener el ID)
    const newResource = await prisma.resource.create({
      data: {
        name,
        description,
        location,
        rules: rules ? (typeof rules === 'string' ? JSON.parse(rules) : rules) : [],
        deposit: Number(deposit),
        category,
        ownerId: req.user.id,
        availabilities: parsedAvailabilities && parsedAvailabilities.length > 0 ? {
          create: parsedAvailabilities.map(av => ({
            dayOfWeek: av.day_of_week,
            startTime: new Date(`1970-01-01T${av.start_time}Z`),
            endTime: new Date(`1970-01-01T${av.end_time}Z`)
          }))
        } : undefined
      },
      include: {
        availabilities: true
      }
    });

    // 3. Si hay imágenes, subirlas a Supabase usando el ID del recurso
    if (req.files && req.files.length > 0) {
      const publicUrls = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const imageFile = req.files[i];
        const fileExt = imageFile.originalname.split('.').pop();
        const fileName = `image_${Date.now()}_${i}.${fileExt}`;
        const filePath = `${newResource.resourceId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('RessourcesImages')
          .upload(filePath, imageFile.buffer, {
            contentType: imageFile.mimetype,
            upsert: true
          });

        if (error) {
          console.error(`Error subiendo imagen ${i} a Supabase Storage:`, error);
        } else {
          // Obtener URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('RessourcesImages')
            .getPublicUrl(filePath);
          
          publicUrls.push(publicUrl);
        }
      }

      if (publicUrls.length > 0) {
        // Actualizar el recurso con el array de URLs
        await prisma.resource.update({
          where: { resourceId: newResource.resourceId },
          data: { photoUrls: publicUrls }
        });
        
        newResource.photo_urls = publicUrls;
      }
    }
    
    res.status(201).json(newResource);
  } catch (error) {
    console.error("Error al crear recurso:", error);
    res.status(500).json({ error: "No se pudo crear el recurso" });
  }
};

// Actualizar un recurso
export const updateResource = async (req, res) => {
  const { id } = req.params;
  let { name, description, location, photoUrls, rules, deposit, category, isArchived } = req.body;

  try {
    // Si es una petición multipart (FormData), parseamos los campos necesarios
    if (rules && typeof rules === 'string') rules = JSON.parse(rules);
    if (deposit) deposit = Number(deposit);
    if (isArchived === 'true') isArchived = true;
    if (isArchived === 'false') isArchived = false;

    // 1. Si hay nuevas imágenes, subirlas
    if (req.files && req.files.length > 0) {
      const publicUrls = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const imageFile = req.files[i];
        const fileExt = imageFile.originalname.split('.').pop();
        const fileName = `image_${Date.now()}_${i}.${fileExt}`;
        const filePath = `${id}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('RessourcesImages')
          .upload(filePath, imageFile.buffer, {
            contentType: imageFile.mimetype,
            upsert: true
          });

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('RessourcesImages')
            .getPublicUrl(filePath);
          
          publicUrls.push(publicUrl);
        }
      }

      if (publicUrls.length > 0) {
        photoUrls = publicUrls;
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (photoUrls !== undefined) updateData.photoUrls = photoUrls;
    if (rules !== undefined) updateData.rules = rules;
    if (deposit !== undefined) updateData.deposit = deposit;
    if (category !== undefined) updateData.category = category;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const updatedResource = await prisma.resource.update({
      where: { resourceId: id },
      data: updateData
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
      where: { resourceId: id }
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
        resourceId: id,
        dayOfWeek: day_of_week,
        startTime: new Date(`1970-01-01T${start_time}Z`),
        endTime: new Date(`1970-01-01T${end_time}Z`)
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
      where: { availabilityId: availability_id }
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
