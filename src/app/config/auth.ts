import { env } from './env';


export const authOptions = {
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout", 
    error: "/auth/error",
  },
  session: {
    strategy: "database" as const,
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google" || account?.provider === "github") {
        return true;
      }
      return false;
    },
    async redirect({ url, baseUrl }: any) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, user }: any) {
      if (session?.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }: any) {
      console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
    async signOut({ session, token }: any) {
      console.log(`User signed out`);
    },
  },
  debug: env.NODE_ENV === "development",
};
