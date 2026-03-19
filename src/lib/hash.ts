import argon2 from "argon2";

/**
 * Convierte el link original en un hash seguro.
 */
export async function hashLink(link: string): Promise<string> {
  return await argon2.hash(link);
}

/**
 * Compara un link plano con el hash guardado.
 * Útil si quieres que el usuario confirme el link antes de redirigir.
 */
export async function verifyLink(
  hash: string,
  plainLink: string,
): Promise<boolean> {
  return await argon2.verify(hash, plainLink);
}
