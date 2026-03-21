import { prisma } from "../config/prismaClient.js";

// Crear una reserva
export const createReservation = async (req, res) => {
  const { resource_id, date, start_time, end_time } = req.body;
  const user_id = req.user.id;

  if (!resource_id || !date || !start_time || !end_time) {
    return res.status(400).json({ error: "Faltan campos obligatorios para la reserva" });
  }

  try {
    // Convertir a DateTime de Prisma
    const reservationDate = new Date(date);
    const reservationStartTime = new Date(`1970-01-01T${start_time}Z`);
    const reservationEndTime = new Date(`1970-01-01T${end_time}Z`);

    // Validación básica de solapamiento
    const overlappingReservations = await prisma.reservation.findMany({
      where: {
        resource_id,
        date: reservationDate,
        AND: [
          { start_time: { lt: reservationEndTime } },
          { end_time: { gt: reservationStartTime } }
        ]
      }
    });

    if (overlappingReservations.length > 0) {
      return res.status(400).json({ error: "El recurso ya cuenta con una reserva en ese horario" });
    }

    const newReservation = await prisma.reservation.create({
      data: {
        resource_id,
        user_id,
        date: reservationDate,
        start_time: reservationStartTime,
        end_time: reservationEndTime
      }
    });

    res.status(201).json(newReservation);
  } catch (error) {
    console.error("Error al crear la reserva:", error);
    res.status(500).json({ error: "No se pudo crear la reserva" });
  }
};

// Obtener las reservas del usuario autenticado
export const getUserReservations = async (req, res) => {
  const user_id = req.user.id;

  try {
    const reservations = await prisma.reservation.findMany({
      where: { user_id },
      include: {
        resource: true
      },
      orderBy: [
        { date: 'desc' },
        { start_time: 'desc' }
      ]
    });

    res.json(reservations);
  } catch (error) {
    console.error("Error al obtener reservas del usuario:", error);
    res.status(500).json({ error: "No se pudieron obtener las reservas" });
  }
};

// Cancelar una reserva
export const deleteReservation = async (req, res) => {
  const { id } = req.params; // reservation_id
  const user_id = req.user.id;

  try {
    // Validar que la reserva le pertenece al usuario
    const reservation = await prisma.reservation.findUnique({
      where: { reservation_id: id }
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    if (reservation.user_id !== user_id) {
      return res.status(403).json({ error: "No tienes permiso para cancelar esta reserva" });
    }

    await prisma.reservation.delete({
      where: { reservation_id: id }
    });

    res.json({ message: "Reserva cancelada exitosamente" });
  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    res.status(500).json({ error: "No se pudo cancelar la reserva" });
  }
};
