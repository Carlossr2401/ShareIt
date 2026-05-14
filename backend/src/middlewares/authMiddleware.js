import { supabase } from "../config/supabaseClient.js";
import { prisma } from "../config/prismaClient.js";

export const requireAuth = async (req, res, next) => {
  try {
    let accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken && !refreshToken) {
      return res
        .status(401)
        .json({ error: "No autorizado, no hay sesión activa" });
    }

    let user = null;

    // 1. Intentamos validar el access_token actual
    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (!error && data?.user) {
        user = data.user;
      }
    }

    // 2. Si el access_token es inválido/expirado, pero tenemos refresh_token
    if (!user && refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (!error && data?.session) {
        user = data.user;

        // Actualizar las cookies en la respuesta
        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
          httpOnly: true,
          secure: isProduction,
          sameSite: "strict",
        };

        res.cookie("access_token", data.session.access_token, {
          ...cookieOptions,
          maxAge: data.session.expires_in * 1000,
        });

        res.cookie("refresh_token", data.session.refresh_token, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }
    }

    // 3. Si aun así no tenemos usuario válido
    if (!user) {
      return res
        .status(401)
        .json({ error: "Token inválido o sesión expirada" });
    }

    // Guardar el usuario en la request
    req.user = user;
    next();
  } catch (error) {
    console.error("Error en middleware de autenticación:", error);
    res.status(500).json({ error: "Error en el servidor al autenticar" });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });

    if (!profile || profile.role !== "ADMIN") {
      return res.status(403).json({ error: "No tienes permisos de administrador" });
    }

    next();
  } catch (error) {
    console.error("Error al verificar rol de administrador:", error);
    res.status(500).json({ error: "Error al verificar permisos" });
  }
};
