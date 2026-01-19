import prisma from '@/_lib/prisma';

export async function getIsAdmin() {
    try {
        await prisma.$connect();

        const count = await prisma.users.count({
            where: { role: 'ADMIN' }
        });

        return count > 0;
    } catch (error) {
        console.error('Error accessing the database:', error);
        return false;
    }
}