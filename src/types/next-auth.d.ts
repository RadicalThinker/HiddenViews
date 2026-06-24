import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      isAcceptingMessages?: boolean;
      username?: string;
      profileStats?: {
        totalEvents?: number;
        totalReviews?: number;
        totalQueries?: number;
        resolvedQueries?: number;
        averageRating?: number;
      };
    } & DefaultSession['user'];
  }

  interface User {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
    profileStats?: {
      totalEvents?: number;
      totalReviews?: number;
      totalQueries?: number;
      resolvedQueries?: number;
      averageRating?: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
    profileStats?: {
      totalEvents?: number;
      totalReviews?: number;
      totalQueries?: number;
      resolvedQueries?: number;
      averageRating?: number;
    };
  }
}
