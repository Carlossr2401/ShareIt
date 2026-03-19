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
    const { email, password, name, username, avatar_url, bio } = req.body;

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

    // Crear entrada en la tabla 'profiles' usando Prisma
    if (data.user) {
      await prisma.profile.create({
        data: {
          id: data.user.id, // Enlazamos con el ID de Supabase Auth
          username: username,
          full_name: name || null,
          avatar_url: avatar_url || null,
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

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    next(error);
  }
};
