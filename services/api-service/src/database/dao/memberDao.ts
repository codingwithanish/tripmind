import { prisma } from '../prismaClient';
import { Member, Prisma } from '@prisma/client';

// JSONB type definitions for type safety
export interface InterestProfile {
    travel_interest?: string[];
    food_interest?: string[];
    activity_preferences?: string[];
}

export interface LocationCoordinates {
    lat: number;
    lng: number;
}

export interface LocationInfo {
    coordinates?: LocationCoordinates;
    location_name?: string;
    address?: string;
}

export interface LocationDetails {
    primary_location?: LocationInfo;
    office_location?: LocationInfo;
    other_locations?: LocationInfo[];
}

export interface PassportInfo {
    available: boolean;
    country?: string;
    expiry_date?: string;
}

export interface VisaInfo {
    country: string;
    type: string;
    expiry_date?: string;
    status: 'valid' | 'expired' | 'pending';
}

export interface TravelProfile {
    passport?: PassportInfo;
    visas?: VisaInfo[];
}

export interface TravelInstructions {
    food_restrictions?: string[];
    medical_conditions?: string[];
    accessibility_needs?: string[];
    preferences?: string[];
    special_requirements?: string[];
}

// Input types
export interface CreateMemberInput {
    userEmail: string;
    name: string;
    avatar?: string;
    isPrimaryMember?: boolean;
    dob?: Date;
    relation?: string;
    interestProfile?: InterestProfile;
    locationDetails?: LocationDetails;
    travelProfile?: TravelProfile;
    travelInstructions?: TravelInstructions;
}

export interface UpdateMemberInput {
    name?: string;
    avatar?: string;
    isPrimaryMember?: boolean;
    dob?: Date;
    relation?: string;
    interestProfile?: InterestProfile;
    locationDetails?: LocationDetails;
    travelProfile?: TravelProfile;
    travelInstructions?: TravelInstructions;
}

class MemberDao {
    /**
     * Find member by ID
     */
    async findById(id: string): Promise<Member | null> {
        return prisma.member.findUnique({
            where: { id },
        });
    }

    /**
     * Find all members for a user
     */
    async findByUserEmail(userEmail: string): Promise<Member[]> {
        return prisma.member.findMany({
            where: { userEmail },
            orderBy: [
                { isPrimaryMember: 'desc' },
                { createdAt: 'asc' },
            ],
        });
    }

    /**
     * Find primary member for a user
     */
    async findPrimaryMember(userEmail: string): Promise<Member | null> {
        return prisma.member.findFirst({
            where: {
                userEmail,
                isPrimaryMember: true,
            },
        });
    }

    /**
     * Create a new member
     */
    async create(data: CreateMemberInput): Promise<Member> {
        return prisma.member.create({
            data: {
                userEmail: data.userEmail,
                name: data.name,
                avatar: data.avatar,
                isPrimaryMember: data.isPrimaryMember ?? false,
                dob: data.dob,
                relation: data.relation,
                interestProfile: data.interestProfile as any,
                locationDetails: data.locationDetails as any,
                travelProfile: data.travelProfile as any,
                travelInstructions: data.travelInstructions as any,
            },
        });
    }

    /**
     * Create primary member for a new user
     */
    async createPrimaryMember(userEmail: string, name: string): Promise<Member> {
        return this.create({
            userEmail,
            name,
            isPrimaryMember: true,
        });
    }

    /**
     * Update member by ID
     */
    async update(id: string, data: UpdateMemberInput): Promise<Member> {
        const updateData: Prisma.MemberUpdateInput = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.avatar !== undefined) updateData.avatar = data.avatar;
        if (data.isPrimaryMember !== undefined) updateData.isPrimaryMember = data.isPrimaryMember;
        if (data.dob !== undefined) updateData.dob = data.dob;
        if (data.relation !== undefined) updateData.relation = data.relation;
        if (data.interestProfile !== undefined) {
            updateData.interestProfile = data.interestProfile as any;
        }
        if (data.locationDetails !== undefined) {
            updateData.locationDetails = data.locationDetails as any;
        }
        if (data.travelProfile !== undefined) {
            updateData.travelProfile = data.travelProfile as any;
        }
        if (data.travelInstructions !== undefined) {
            updateData.travelInstructions = data.travelInstructions as any;
        }

        return prisma.member.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Set primary member (unsets previous primary)
     */
    async setPrimaryMember(userEmail: string, memberId: string): Promise<Member> {
        // First, unset any existing primary member
        await prisma.member.updateMany({
            where: {
                userEmail,
                isPrimaryMember: true,
            },
            data: { isPrimaryMember: false },
        });

        // Set new primary member
        return prisma.member.update({
            where: { id: memberId },
            data: { isPrimaryMember: true },
        });
    }

    /**
     * Delete member by ID
     */
    async delete(id: string): Promise<Member> {
        return prisma.member.delete({
            where: { id },
        });
    }

    /**
     * Delete all members for a user
     */
    async deleteByUserEmail(userEmail: string): Promise<number> {
        const result = await prisma.member.deleteMany({
            where: { userEmail },
        });
        return result.count;
    }

    /**
     * Count members for a user
     */
    async countByUserEmail(userEmail: string): Promise<number> {
        return prisma.member.count({
            where: { userEmail },
        });
    }

    /**
     * Update travel profile for a member
     */
    async updateTravelProfile(id: string, travelProfile: TravelProfile): Promise<Member> {
        return prisma.member.update({
            where: { id },
            data: {
                travelProfile: travelProfile as any,
            },
        });
    }

    /**
     * Update interest profile for a member
     */
    async updateInterestProfile(id: string, interestProfile: InterestProfile): Promise<Member> {
        return prisma.member.update({
            where: { id },
            data: {
                interestProfile: interestProfile as any,
            },
        });
    }
}

export const memberDao = new MemberDao();
export default memberDao;
