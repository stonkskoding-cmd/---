export declare function getAdminBearerToken(): string | null;
export declare function isValidAdminToken(token: string | null | undefined): boolean;
export declare function clearAdminSession(): void;
export declare function canAccessAdminRoute(): boolean;
