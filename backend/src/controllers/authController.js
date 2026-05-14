import { supabase } from "../config/supabaseClient.js";
import { prisma } from "../config/prismaClient.js";

// Helper para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper para validar contraseña (6-12 caracteres, sin espacios)
const isValidPassword = (password) => {
  return password.length >= 6 && password.length <= 12 && !/\s/.test(password);
};

export const signup = async (req, res, next) => {
  try {
    const { email, password, name, username, bio } = req.body;
    let { avatar_url } = req.body;

    // Validación de campos obligatorios
    if (!email || !password || !username) {
      return res.status(400).json({
        error: "Email, contraseña y nombre de usuario son requeridos",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error:
          "La contraseña debe tener entre 6 y 12 caracteres y no contener espacios",
      });
    }

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({
        error: "El nombre debe tener entre 2 y 50 caracteres",
      });
    }

    if (username.length < 2 || username.length > 50) {
      return res.status(400).json({
        error: "El nombre de usuario debe tener entre 2 y 50 caracteres",
      });
    }

    if (bio && bio.length > 255) {
      return res.status(400).json({
        error: "La biografía debe tener menos de 255 caracteres",
      });
    }

    if (!avatar_url) {
      const avatarName = encodeURIComponent(name || username || '');
      avatar_url = `https://ui-avatars.com/api/?name=${avatarName}&background=random`;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
          avatar_url,
          bio,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.user) {
      await prisma.profile.create({
        data: {
          id: data.user.id,
          email: email,
          username: username,
          fullName: name || null,
          avatarUrl: avatar_url || null,
          bio: bio || null,
        },
      });
    }

    res.status(201).json({
      message: "Usuario registrado con éxito. Perfil creado.",
      user: data.user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son requeridos" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: data.session.expires_in * 1000,
    };

    res.cookie("access_token", data.session.access_token, cookieOptions);
    if (data.session.refresh_token) {
      res.cookie("refresh_token", data.session.refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
      });
    }

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: data.user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
    };

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out from Supabase", error);
    }

    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);

    res.status(200).json({ message: "Sesión cerrada con éxito" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    res.status(200).json({
      ...profile,
      role: req.user.app_metadata?.role || "user"
    });
  } catch (error) {
    console.error("Error en getMe:", error);
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

export const topUpWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "El importe debe ser un número positivo" });
    }

    const profile = await prisma.profile.update({
      where: { id: req.user.id },
      data: {
        wallet: {
          increment: parseFloat(amount)
        }
      }
    });
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error en topUpWallet:", error);
    res.status(500).json({ error: "No se pudo realizar la recarga" });
  }
};

// Generar un token de reset aleatorio
const generateResetToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El email es requerido" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }

    const profile = await prisma.profile.findUnique({
      where: { email: email },
    });

    if (!profile) {
      // Por seguridad, no revelar si el email existe o no
      return res.status(200).json({
        message: "Si el email existe en el sistema, recibirá un enlace para resetear la contraseña",
      });
    }

    // Generar token válido por 1 hora
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.profile.update({
      where: { email: email },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
      },
    });

    // Mock: en un sistema real, aquí se enviaría un email
    console.log(`[MOCK] Reset token para ${email}: ${resetToken}`);
    console.log(`[MOCK] Token válido hasta: ${resetTokenExpiry.toISOString()}`);

    res.status(200).json({
      message: "Si el email existe en el sistema, recibirá un enlace para resetear la contraseña",
      // Solo en desarrollo: devolver el token para testing
      ...(process.env.NODE_ENV !== "production" && { resetToken, resetTokenExpiry }),
    });
  } catch (error) {
    console.error("Error en requestPasswordReset:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: "Email, token y nueva contraseña son requeridos" });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        error: "La contraseña debe tener entre 6 y 12 caracteres y no contener espacios",
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { email: email },
    });

    if (!profile) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    if (!profile.resetToken || profile.resetToken !== resetToken) {
      return res.status(400).json({ error: "Token inválido o expirado" });
    }

    if (!profile.resetTokenExpiry || profile.resetTokenExpiry < new Date()) {
      return res.status(400).json({ error: "El token ha expirado" });
    }

    // Actualizar contraseña en Supabase
    const { error } = await supabase.auth.admin.updateUserById(profile.id, {
      password: newPassword,
    });

    if (error) {
      console.error("Error actualizando contraseña en Supabase:", error);
      return res.status(500).json({ error: "Error al actualizar la contraseña" });
    }

    // Limpiar el token de reset
    await prisma.profile.update({
      where: { email: email },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ error: "Error al resetear la contraseña" });
  }
};