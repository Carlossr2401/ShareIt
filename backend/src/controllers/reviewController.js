import { prisma } from "../config/prismaClient.js";
import { supabase } from "../config/supabaseClient.js";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });
export const uploadImages = upload.array("images", 5);

// Crear una nueva reseña
export const createReview = async (req, res) => {
  const { reservation_id, target_id, rating, comment, role } = req.body;
  const reviewer_id = req.user.id;

  if (!reservation_id || !target_id || !rating || !role) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // Verificar que la reserva existe
    const reservation = await prisma.reservation.findUnique({
      where: { reservationId: reservation_id }
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    // Comprobar que no existe ya una review de este usuario para esta reserva
    const existingReview = await prisma.review.findFirst({
      where: {
        reservationId: reservation_id,
        reviewerId: reviewer_id
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: "Ya has valorado esta reserva" });
    }

    const newReview = await prisma.review.create({
      data: {
        reservationId: reservation_id,
        reviewerId: reviewer_id,
        targetId: target_id,
        rating: Number(rating),
        comment,
        role
      }
    });

    // Subir imágenes si existen
    if (req.files && req.files.length > 0) {
      const publicUrls = [];
      for (let i = 0; i < req.files.length; i++) {
        const imageFile = req.files[i];
        const fileExt = imageFile.originalname.split(".").pop();
        const fileName = `review_${Date.now()}_${i}.${fileExt}`;
        const filePath = `${newReview.id}/${fileName}`;

        const { error } = await supabase.storage
          .from("ReviewsImages") // Recuerda crear este bucket en Supabase
          .upload(filePath, imageFile.buffer, {
            contentType: imageFile.mimetype,
            upsert: true,
          });

        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from("ReviewsImages").getPublicUrl(filePath);
          publicUrls.push(publicUrl);
        } else {
           console.error(`Error subiendo imagen ${i} de reseña a Supabase Storage:`, error);
        }
      }

      if (publicUrls.length > 0) {
        await prisma.review.update({
          where: { id: newReview.id },
          data: { imageUrls: publicUrls }
        });
        newReview.imageUrls = publicUrls;
      }
    }

    res.status(201).json(newReview);

  } catch (error) {
    console.error("Error al crear reseña:", error);
    res.status(500).json({ error: "No se pudo crear la reseña" });
  }
};

// Obtener las reseñas que ha recibido un usuario (target_id)
export const getReviewsByTarget = async (req, res) => {
  const { targetId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { targetId: targetId },
      include: {
        reviewer: {
          select: {
            username: true,
            fullName: true,
            avatarUrl: true
          }
        },
        reservation: {
          include: {
            resource: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    console.error("Error al obtener reseñas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener las reseñas de una reserva en concreto
export const getReviewsByReservation = async (req, res) => {
  const { reservationId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { reservationId: reservationId },
      include: {
        reviewer: {
          select: { username: true, avatarUrl: true }
        }
      }
    });

    res.json(reviews);
  } catch (error) {
    console.error("Error al obtener reseñas de la reserva:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
