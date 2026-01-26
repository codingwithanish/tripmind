import { Request, Response, NextFunction } from 'express';
import { memberDao, userDao } from '../database/dao';
import { CreateMemberInput } from '../database/dao/memberDao';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userEmail = (req as any).user?.userEmail;
        if (!userEmail) {
            throw new Error('User context not found');
        }

        const user = await userDao.findByEmail(userEmail);
        if (!user) {
            throw new Error('User not found');
        }

        const members = await memberDao.findByUserEmail(userEmail);

        // Calculate age for each member
        const membersWithAge = members.map(member => {
            let age = null;
            if (member.dob) {
                const today = new Date();
                const birthDate = new Date(member.dob);
                age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }
            return { ...member, age };
        });

        res.json({
            success: true,
            data: {
                user: {
                    email: user.email,
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                    emailVerified: user.emailVerified,
                    phoneNumberVerified: user.phoneNumberVerified,
                    authProvider: user.authProvider,
                },
                members: membersWithAge
            }
        });
    } catch (error) {
        next(error);
    }
};

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userEmail = (req as any).user?.userEmail;
        if (!userEmail) {
            throw new Error('User context not found');
        }

        const { name, dob, relation, interestProfile, avatar } = req.body;

        // Validate relation
        const allowedRelations = ['Friend', 'Spouse', 'Parent', 'Children', 'Others'];
        if (relation && !allowedRelations.includes(relation)) {
            throw new Error(`Invalid relation type. Allowed: ${allowedRelations.join(', ')}`);
        }

        const input: CreateMemberInput = {
            userEmail,
            name,
            dob: dob ? new Date(dob) : undefined,
            relation,
            interestProfile,
            avatar,
            isPrimaryMember: false // Explicitly false for added members
        };

        const newMember = await memberDao.create(input);

        // consistent response
        let age = null;
        if (newMember.dob) {
            const today = new Date();
            const birthDate = new Date(newMember.dob);
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

        res.status(201).json({
            success: true,
            data: { ...newMember, age }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userEmail = (req as any).user?.userEmail;
        const memberId = req.params.id;

        if (!userEmail) {
            throw new Error('User context not found');
        }

        const member = await memberDao.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        if (member.userEmail !== userEmail) {
            throw new Error('Unauthorized to delete this member');
        }

        if (member.isPrimaryMember) {
            throw new Error('Cannot delete primary member from profile');
        }

        await memberDao.delete(memberId);

        res.json({
            success: true,
            message: 'Member deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
