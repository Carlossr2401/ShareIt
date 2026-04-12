import { prisma } from "../config/prismaClient.js";

export const createReservation = async (req, res) => {
  const { resource_id, date, start_time, end_time } = req.body;
  const user_id = req.user.id;

  if (!resource_id || !date || !start_time || !end_time) {
    return res.status(400).json({ error: "Faltan campos obligatorios para la reserva" });
  }

  try {
    const reservationDate = new Date(date);
    const reservationStartTime = new Date(`1970-01-01T${start_time}Z`);
    const reservationEndTime = new Date(`1970-01-01T${end_time}Z`);

    const result = await prisma.$transaction(async (tx) => {
      
      const resource = await tx.resource.findUnique({
        where: { resourceId: resource_id }
      });

      if (!resource) throw new Error("Recurso no encontrado");

      const profile = await tx.profile.findUnique({
        where: { id: user_id }
      });

      if (!profile || profile.wallet < resource.deposit) {
        throw new Error("Saldo insuficiente en tu Wallet para realizar esta reserva");
      }

      const overlapping = await tx.reservation.findMany({
        where: {
          resourceId: resource_id,
          date: reservationDate,
          AND: [
            { startTime: { lt: reservationEndTime } },
            { endTime: { gt: reservationStartTime } }
          ]
        }
      });

      if (overlapping.length > 0) {
        throw new Error("El recurso ya cuenta con una reserva en ese horario");
      }

      await tx.profile.update({
        where: { id: user_id },
        data: { wallet: { decrement: resource.deposit } }
      });

      return await tx.reservation.create({
        data: {
          resourceId: resource_id,
          userId: user_id,
          date: reservationDate,
          startTime: reservationStartTime,
          endTime: reservationEndTime
        }
      });
    });

    res.status(201).json(result);

  } catch (error) {
    console.error("Error en el proceso de reserva:", error.message);
    res.status(400).json({ error: error.message || "No se pudo procesar la reserva" });
  }
};

export const getUserReservations = async (req, res) => {
  const user_id = req.user.id;

  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId: user_id },
      include: {
        resource: true
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' }
      ]
    });

    res.json(reservations);
  } catch (error) {
    console.error("Error al obtener reservas del usuario:", error);
    res.status(500).json({ error: "No se pudieron obtener las reservas" });
  }
};

export const deleteReservation = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { reservationId: id },
        include: { resource: true }
      });

      if (!reservation) throw new Error("Reserva no encontrada");
      if (reservation.userId !== user_id) throw new Error("No tienes permiso para cancelar esta reserva");

      await tx.profile.update({
        where: { id: user_id },
        data: {
          wallet: {
            increment: reservation.resource.deposit
          }
        }
      });

      return await tx.reservation.delete({
        where: { reservationId: id }
      });
    });

    res.json({ message: "Reserva cancelada y depósito devuelto a tu Wallet" });
  } catch (error) {
    console.error("Error al cancelar la reserva:", error.message);
    res.status(400).json({ error: error.message || "No se pudo cancelar la reserva" });
  }
};

export const getAllReservations = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        resource: true,
        user: true
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' }
      ]
    });

    res.json(reservations);
  } catch (error) {
    console.error("Error al obtener todas las reservas:", error);
    res.status(500).json({ error: "No se pudieron obtener las reservas" });
  }
};
