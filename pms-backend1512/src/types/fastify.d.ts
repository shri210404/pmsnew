declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      username: string;
      role?: string;
    };
  }
}

