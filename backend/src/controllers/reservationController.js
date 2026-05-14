import { prisma } from "../config/prismaClient.js";

export const createReservation = async (req, res) => {
  const { resourceId, date, startTime, endTime, paymentMethod = "WALLET" } = req.body;
  const user_id = req.user.id;

  if (!resourceId || !date || !startTime || !endTime) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios para la reserva" });
  }

  try {
    const reservationDate = new Date(date);

    // Validación de fecha pasada
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (reservationDate < today) {
      return res.status(400).json({ error: "No se pueden realizar reservas en fechas pasadas" });
    }

    const reservationStartTime = new Date(`1970-01-01T${startTime}Z`);
    const reservationEndTime = new Date(`1970-01-01T${endTime}Z`);

    const result = await prisma.$transaction(async (tx) => {
      const resource = await tx.resource.findUnique({
        where: { resourceId: resourceId },
      });

      if (!resource) throw new Error("Recurso no encontrado");

      const profile = await tx.profile.findUnique({
        where: { id: user_id },
      });

      const total_amount = (resource.deposit || 0) + (resource.price || 0);

      // Si es pago con MONEDERO (WALLET), verificar saldo
      if (paymentMethod === "WALLET") {
        if (!profile || profile.wallet < total_amount) {
          throw new Error(
            "Saldo insuficiente en tu Wallet para realizar esta reserva",
          );
        }

        // Descontar del monedero
        await tx.profile.update({
          where: { id: user_id },
          data: { wallet: { decrement: total_amount } },
        });
      } else if (paymentMethod === "CARD") {
        // Simulación de pago con tarjeta (siempre éxito en este MVP)
        console.log(`Pago con tarjeta procesado: €${total_amount} para el usuario ${user_id}`);
      }

      const overlapping = await tx.reservation.findMany({
        where: {
          resourceId: resourceId,
          date: reservationDate,
          AND: [
            { startTime: { lt: reservationEndTime } },
            { endTime: { gt: reservationStartTime } },
          ],
        },
      });

      if (overlapping.length > 0) {
        throw new Error("El recurso ya cuenta con una reserva en ese horario");
      }

      return await tx.reservation.create({
        data: {
          resourceId: resourceId,
          userId: user_id,
          date: reservationDate,
          startTime: reservationStartTime,
          endTime: reservationEndTime,
          paymentMethod: paymentMethod,
          total_amount: total_amount
        },
      });
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error en el proceso de reserva:", error.message);
    res
      .status(400)
      .json({ error: error.message || "No se pudo procesar la reserva" });
  }
};

export const getUserReservations = async (req, res) => {
  const user_id = req.user.id;

  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId: user_id },
      include: {
        resource: true,
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
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
        include: { resource: true },
      });

      if (!reservation) throw new Error("Reserva no encontrada");
      if (reservation.userId !== user_id)
        throw new Error("No tienes permiso para cancelar esta reserva");

      await tx.profile.update({
        where: { id: user_id },
        data: {
          wallet: {
            increment: reservation.resource.deposit,
          },
        },
      });

      return await tx.reservation.delete({
        where: { reservationId: id },
      });
    });

    res.json({ message: "Reserva cancelada y depósito devuelto a tu Wallet" });
  } catch (error) {
    console.error("Error al cancelar la reserva:", error.message);
    res
      .status(400)
      .json({ error: error.message || "No se pudo cancelar la reserva" });
  }
};

export const getAllReservations = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        resource: true,
        user: true,
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    });

    res.json(reservations);
  } catch (error) {
    console.error("Error al obtener todas las reservas:", error);
    res.status(500).json({ error: "No se pudieron obtener las reservas" });
  }
};

export const checkInReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { reservationId: id },
      include: { resource: true, user: true },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    if (reservation.status === "CHECKED_IN") {
      return res.status(400).json({ error: "El check-in ya fue realizado previamente" });
    }

    const updated = await prisma.reservation.update({
      where: { reservationId: id },
      data: { status: "CHECKED_IN" },
    });

    res.json({ message: "Check-in realizado exitosamente", reservation: updated });
  } catch (error) {
    console.error("Error en el check-in:", error);
    res.status(500).json({ error: "Error interno procesando el check-in" });
  }
};
