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
        // NOTE: resolvedQueries is intentionally absent here — it is not
        // maintained anywhere on the User document. Use Event.stats.resolvedQueries.
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
      averageRating?: number;
    };
  }
}
