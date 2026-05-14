import { prisma } from "../config/prismaClient.js";

// GET /api/users
export const getUsers = async (req, res) => {
  try {
    const { search } = req.query;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
            { fullName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const users = await prisma.profile.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        wallet: true,
        role: true,
        createdAt: true,
        _count: {
          select: { reservations: true, penalties: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
};

// GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.profile.findUnique({
      where: { id },
      include: {
        reservations: {
          include: {
            resource: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        penalties: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Error fetching user details" });
  }
};

// POST /api/users/:id/penalties
export const addPenalty = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, points } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Reason is required" });
    }

    const penalty = await prisma.penalty.create({
      data: {
        userId: id,
        reason,
        points: points || 1,
      },
    });

    res.status(201).json(penalty);
  } catch (error) {
    console.error("Error adding penalty:", error);
    res.status(500).json({ error: "Error adding penalty" });
  }
};

// DELETE /api/users/:id/penalties/:penaltyId
export const removePenalty = async (req, res) => {
  try {
    const { id, penaltyId } = req.params;

    // Check if penalty exists and belongs to user
    const penalty = await prisma.penalty.findUnique({
      where: { penaltyId },
    });

    if (!penalty || penalty.userId !== id) {
      return res.status(404).json({ error: "Penalty not found" });
    }

    await prisma.penalty.delete({
      where: { penaltyId },
    });

    res.json({ message: "Penalty removed successfully" });
  } catch (error) {
    console.error("Error removing penalty:", error);
    res.status(500).json({ error: "Error removing penalty" });
  }
};
