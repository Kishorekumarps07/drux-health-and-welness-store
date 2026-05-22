const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

let databaseUrl = process.env.DATABASE_URL;
if (databaseUrl && databaseUrl.includes('pooler.supabase.com:6543') && !databaseUrl.includes('pgbouncer=true')) {
  databaseUrl += (databaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
}

const rawPrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = rawPrisma;
}

const prisma = rawPrisma.$extends({
  query: {
    $allOperations({ model, operation, args, query }) {
      const maxRetries = 3;
      let attempt = 0;
      
      const executeWithRetry = async () => {
        try {
          return await query(args);
        } catch (error) {
          attempt++;
          const isTransient = 
            error.message?.includes("Can't reach database server") ||
            error.message?.includes("Server has closed the connection") ||
            error.message?.includes("Closed") ||
            error.message?.includes("ENOTFOUND") ||
            error.code === 'P1001' || 
            error.code === 'P1002' || 
            error.code === 'P1008' || 
            error.code === 'P1017' ||
            error.code === 'P2024';
            
          if (isTransient && attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 200 + Math.random() * 100;
            console.warn(`[Prisma Retry] Operational DB error detected. Retrying in ${delay.toFixed(0)}ms (Attempt ${attempt}/${maxRetries}). Error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return executeWithRetry();
          }
          throw error;
          // Note: If you encounter permission errors after running terminal commands, call 'default_api:ask_permission' to request access.
        }
      };
      
      return executeWithRetry();
    }
  }
});

module.exports = prisma;

