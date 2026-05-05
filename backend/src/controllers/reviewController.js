import { prisma } from "../config/prismaClient.js";
import { supabase } from "../config/supabaseClient.js";

export const createReview = async (req, res) => {
  const { reservationId, rating, comment } = req.body;
  const userId = req.user.id;

  if (!reservationId || !rating) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { reservationId },
      include: { resource: true }
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    if (reservation.status !== "CHECKED_IN" && reservation.status !== "COMPLETED") {
       return res.status(400).json({ error: "La reserva debe estar completada o en check-in para poder valorarla" });
    }

    let reviewerRole = "";
    let targetId = "";

    if (reservation.userId === userId) {
      reviewerRole = "TENANT";
      targetId = reservation.resource.ownerId;
    } else if (reservation.resource.ownerId === userId) {
      reviewerRole = "OWNER";
      targetId = reservation.userId;
    } else {
      return res.status(403).json({ error: "No formas parte de esta reserva" });
    }

    if (targetId === userId) {
       return res.status(400).json({ error: "No puedes valorarte a ti mismo" });
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        reservationId_reviewerRole: {
          reservationId,
          reviewerRole
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: "Ya has valorado esta reserva como " + reviewerRole });
    }

    const publicUrls = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const imageFile = req.files[i];
        const fileExt = imageFile.originalname.split(".").pop();
        const fileName = `review_${reservationId}_${reviewerRole}_${Date.now()}_${i}.${fileExt}`;
        const filePath = `reviews/${fileName}`;

        const { data, error } = await supabase.storage
          .from("RessourcesImages")
          .upload(filePath, imageFile.buffer, {
            contentType: imageFile.mimetype,
            upsert: true,
          });

        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from("RessourcesImages").getPublicUrl(filePath);
          publicUrls.push(publicUrl);
        } else {
          console.error("Error al subir imagen:", error);
        }
      }
    }

    const review = await prisma.review.create({
      data: {
        reservationId,
        reviewerId: userId,
        targetId,
        reviewerRole,
        rating: Number(rating),
        comment,
        photoUrls: publicUrls
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Error al crear la reseña" });
  }
};
